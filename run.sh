#!/bin/bash

echo "Fixing CSV files"

for f in charity class class_ref charity_aoo aoo_ref; do
    echo "- $f"
    ./fix-csv.sh < ../charity-commission-extract/extract_${f}.csv > ../charity-commission-extract/extract_${f}_clean.csv
done

echo "Converting to JSON"
node filter-csv.js > charities.json
