const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const csvdir = '../charity-commission-extract/';

const stdinBuffer = fs.readFileSync(csvdir+'extract_charity_clean.csv');

const input = stdinBuffer.toString();

const charities = parse(input, {
  columns: true,
  skip_empty_lines: true
}).filter(org => org.orgtype !== "RM") // filter out "removed" charities
.map(org => { delete org.orgtype; return org }); // remove the orgtype field


// use charity number as array key
let charitiesObj = {};
charities.forEach(charity => {
  if (!charitiesObj[charity.regno])
    charitiesObj[charity.regno] = { linkedCharities: [] };
  charitiesObj[charity.regno].linkedCharities.push(charity);
});

// Now we need to add the classifications from extract_class and extract_class_ref

const classesInput = fs.readFileSync(csvdir+'extract_class_clean.csv');
const classes = parse(
  classesInput.toString(),
  { columns: true, skip_empty_lines: true }
);

const classRefsInput = fs.readFileSync(csvdir+'extract_class_ref_clean.csv');
const classRefs = parse(
  classRefsInput.toString(),
  { columns: true, skip_empty_lines: true }
);


classes.forEach(class_ => {
  if (charitiesObj[class_.regno]) { // skip removed charities
    if (!charitiesObj[class_.regno].classes) charitiesObj[class_.regno].classes = [];
    charitiesObj[class_.regno].classes.push(class_.classn);
  }
});

console.log(charitiesObj[200056]);
