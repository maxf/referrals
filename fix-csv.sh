#!/bin/bash

cat /dev/stdin | tr -d '\000' | sed 's/\\"/""/g' | grep -v "^\"\"$" | sed 's//\n/g'  > /dev/stdout

# 1. remove NUL chars
# 2. change \" to "" (\" is not the right way to escape " according to the CSV spec)
# 3. remove line with just ""
# 4. dos to unix carriage returns
