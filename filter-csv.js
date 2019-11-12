const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const stdinBuffer = fs.readFileSync(0);

const input = stdinBuffer.toString();

const records = parse(input, {
  columns: true,
  skip_empty_lines: true
}).filter(org => org.orgtype !== "RM") // filter out "removed" charities
.map(org => { delete org.orgtype; return org });

console.log(records);
