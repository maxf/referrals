const fs = require('fs');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://0.0.0.0:9200' })


console.log('reading charities file');
const input = fs.readFileSync('charities.json');

console.log('parsing charities file as JSON');
const charities = JSON.parse(input).charities;
const nbCharities = Object.keys(charities).length;
const charitiesArray = Object.values(charities);


const cleanup = async function () {
  console.log('deleting old index');
  try {
    await client.indices.delete({ index: 'charities' });
  } catch (e) {
    console.log('failed to delete index:', e);
  }

  console.log('creating index');
  try {
    await client.indices.create({ index: 'charities' });
  } catch (e) {
    console.log('failed to create index:', e);
  }
};

const ingest = async function () {
  const keys = Object.keys(charities);
  const batchSize = 100;

  for (let i=0; i<keys.length; i+=batchSize) {
    const batch = charitiesArray.slice(i, i+batchSize);
    console.log(`batch ${i}-${i+batch.length-1}`);

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

console.log('start');
console.log(`read ${Object.keys(charities).length} charities`);
cleanup()
  .then(ingest)
  .then(() => {
    console.log('finished');
  });
