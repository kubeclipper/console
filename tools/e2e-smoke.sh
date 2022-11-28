#!/bin/bash

wget http://172.16.30.27/caas-test-case/testcases.html

echo "generate e2e report"
npm run test:e2e

echo "generate cases report"
node tools/test_cases_associated.js
