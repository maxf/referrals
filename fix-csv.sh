#!/bin/bash

cat /dev/stdin | tr -d '\000' | sed 's/\\"/""/g' | grep -v "^\"\"$"  > /dev/stdout
