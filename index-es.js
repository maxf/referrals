if (process.argv.length < 3) {
  console.log('Run this as:');
  console.log('node index-ex.js [filenames]');
  process.exit();
}

const filenames = process.argv.slice(2);
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://0.0.0.0:9200' })



const ingestFile = function(filename) {
  const input = fs.readFileSync(filename);
  const charities = JSON.parse(input);

  console.log(`read ${Object.keys(charities).length} charities from ${filename}`);

  ingest(charities);
};


const resetIndex = async function () {
  console.log('deleting old index');
  try {
    await client.indices.delete({ index: 'charities' });
  } catch (e) {
    console.log('failed to delete index:', e.name);
    if (e.name !== 'index_not_found_exception') process.exit();
  }

  console.log('creating index');
  try {
    await client.indices.create({ index: 'charities' });
  } catch (e) {
    console.log('failed to create index:', e);
  }
};

const ingest = async function (charities) {
  const keys = Object.keys(charities);
  const nbCharities = keys.length;
  const charitiesArray = Object.values(charities);
  const batchSize = 100;

  for (let i=0; i<keys.length; i+=batchSize) {
    const batch = charitiesArray.slice(i, i+batchSize);
//    console.log(`batch ${i}-${i+batch.length-1}`);

    const bulkBody = [];

    batch.forEach(charity => {
      const key = charity.linkedCharities[0].regno;
//      console.log('adding ' + key);
      bulkBody.push(JSON.stringify({
        'index' : { '_index' : 'charities', '_id' : key }
      }));
      bulkBody.push(JSON.stringify(charity));
    });

//    console.log('sending bulk request with: ', bulkBody.join('\n'));
    try {
      await client.bulk({
        index: 'charities',
        body: bulkBody.join('\n')+'\n'
      });
    } catch (e) {
      console.log('failed:', e);
    }
  }

};



resetIndex()
  .then(() => {
    filenames.forEach(filename => {
      ingestFile(filename);
    });
  });
