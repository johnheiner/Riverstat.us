/*
 *  This will manually run the function on PRODUCTION
 */

var dotenv = require('dotenv');
dotenv.config({path: './env/config.env.production'});

var XMLtoJSONP = require('../index');

//  Make a dummy context to pass to our function during the test
var testContext = {
  done: function(error, message) {
    console.log('Context: done');
    process.exit(1);
  },
  succeed: function(error, message) {
    console.log('Context: succeed')
    process.exit(1);
  },
  fail: function(error, message) {
    console.log('Context fail');
    process.exit(1);
  }
};
//  Make a dummy event for the test
var testEvent = {
  "account": "123456789012",
  "region": "us-east-1",
  "detail": {},
  "detail-type": "Manually Run Local Event",
  "source": "aws.events",
  "time": new Date().toString(),
  "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
  "resources": [
    "arn:aws:events:us-east-1:123456789012:rule/my-schedule"
  ]
}

XMLtoJSONP.handler(testEvent, testContext);
