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

    // remove empty values
    Object.keys(el).forEach(elKey => {
      if (el[elKey] === '') delete el[elKey];
    });
    result[key][outputKeyName].push(el);
  });
  return result;
};

const charityData = {};

const charities = importCSV('extract_charity_clean.csv')
  .filter(org => org.orgtype !== 'RM') // filter out "removed" charities
  .map(org => {
    delete org.orgtype;
    delete org.gd;
    ['add1', 'add2', 'add3', 'add4', 'add5', 'name'].forEach(fieldName => {
      org[fieldName] = org[fieldName].trim();
    });
    if (org.aob.toUpperCase() === 'NOT DEFINED') delete org.aob;
    return org;
  });


charityData.charities = makeObjectFrom(charities, 'regno', 'linkedCharities');


// add the classifications from extract_class and extract_class_ref

const classDescsObj = {};

importCSV('extract_class_ref_clean.csv').forEach(classDesc => {
  classDescsObj[classDesc.classno] = classDesc.classtext;
});

importCSV('extract_class_clean.csv')
  .forEach(class_ => {
    const charity = charityData.charities[class_.regno];
    if (charity) { // skip removed charities
      if (!charity.classes) charity.classes = [];
      charity.classes.push(classDescsObj[class_.class]);
    }
  });


// add the location information from extract_charity_aoo and extract_aoo_ref

const aooRefs = importCSV('extract_aoo_ref_clean.csv');

const aooRef = (type, key) => {
  const result = [];
  aooRefs.forEach(ref => {
    if (ref.aootype === type && ref.aookey === key) {
      const area = {};
      switch (ref.aootype) {
      case 'A': area.type ='wide'; break;
      case 'B': area.type='local authority'; break;
      case 'C': area.type='Greater London Authority'; break;
      case 'D': area.type='country'; break;
      case 'E': area.type='continent'; break;
      }
      area.name = ref.aooname;
      //      area.sort = ref.aoosort; // Mostly a repetition of name
      result.push(area);
    }
  });
  return result;
}



importCSV('extract_charity_aoo_clean.csv').forEach(aoo => {
  const charity = charityData.charities[aoo.regno];
  if (charity) {
    if (!charity.aoo) charity.aoo = [];
    charity.aoo.push(aooRef(aoo.aootype, aoo.aookey));
  }
});


// charity objects


importCSV('extract_objects_clean.csv').forEach(object => {
  const charity = charityData.charities[object.regno];
  if (charity) {
    const subCharity = charity.linkedCharities.find(sub => sub.subno == object.subno);
    if (subCharity) {
      if (!subCharity.object) subCharity.object = {};
      subCharity.object[object.seqno] = object.object.trim();
    }
  }
});


Object.values(charityData.charities).forEach(charity => {
  charity.linkedCharities.forEach(subCharity => {
    if (subCharity.object) {
      let object = '';
      Object.keys(subCharity.object).sort().forEach(key => {
        object += subCharity.object[key] + ' ';
      });
      subCharity.object = object;
    }
  });
});


console.log(JSON.stringify(charityData, null, 2));
