const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const csvdir = '../charity-commission-extract/';


const importCSV = fileName => {
  const input = fs.readFileSync(csvdir+fileName);
  return parse(
    input.toString(),
    { skip_empty_lines: true, trim: true, columns: true }
  );
};

const makeObjectFrom = (array, keyName, outputKeyName) => {
  const result = {};
  array.forEach(el => {
    const key = el[keyName];
    if (!result[key]) {
      result[key] = {};
      result[key][outputKeyName] = [];
    };
    result[key][outputKeyName].push(el);
  });
  return result;
};

const charityData = {};

const charities = importCSV('extract_charity_clean.csv')
  .filter(org => org.orgtype !== 'RM') // filter out "removed" charities
  .map(org => { delete org.orgtype; return org }); // remove the orgtype field


charityData.charities = makeObjectFrom(charities, 'regno', 'linkedCharities');


// add the classifications from extract_class and extract_class_ref

const classDescsObj = {};

importCSV('extract_class_ref_clean.csv').forEach(classDesc => {
  classDescsObj[classDesc.classno] = classDesc.classtextn;
});

importCSV('extract_class_clean.csv')
  .forEach(class_ => {
    const charity = charityData.charities[class_.regno];
    if (charity) { // skip removed charities
      if (!charity.classes) charity.classes = [];
      charity.classes.push(classDescsObj[class_.classn]);
    }
  });


// add the location information from extract_charity_aoo and extract_aoo_ref

importCSV('extract_charity_aoo_clean.csv').forEach(aoo => {
  const charity = charityData.charities[aoo.regno];
  if (charity) {
    if (!charity.aoo) charity.aoo = [];
    charity.aoo.push(aoo);
  }
});


console.log(JSON.stringify(charityData, null, 2));
