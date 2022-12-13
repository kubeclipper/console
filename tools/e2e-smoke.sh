#!/bin/bash

wget https://oss.kubeclipper.io/test/testcase/main/testcases.html

echo "generate e2e report"
npm run test:e2e

echo "generate cases report"
node tools/test_cases_associated.js
