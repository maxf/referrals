const fs = require('fs');

console.log('reading charities file');
const input = fs.readFileSync('charities.json');

console.log('parsing charities file as JSON');
const charities = JSON.parse(input).charities;
const keys = Object.keys(charities);
const nbCharities = keys.length;
const nbCharitiesPerFile = 1000;
const nbFiles = Math.ceil(nbCharities/nbCharitiesPerFile);

console.log(`Found ${nbCharities} charities`);
console.log(`making ${nbFiles} files`);

for (let i=0; i<nbFiles; i++) {
  const fileCharities = keys.slice(i*nbCharitiesPerFile, (i+1)*nbCharitiesPerFile);
  const charitiesObj = {};
  fileCharities.forEach(key => {
    charitiesObj[key] = charities[key];
  });
  const filename = `part-${i.toString().padStart(4, '0')}.json`;
  console.log(`writing file ${filename}`);
  fs.writeFileSync(filename, JSON.stringify(charitiesObj, null, 2));
  console.log('done');
}
