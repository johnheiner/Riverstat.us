exports.handler = function(event, context) {

  var config = require('./config.json');

  var moment = require('moment');
  require('moment-timezone');

  console.log('-Event Details-');
  console.log('Details:', event['detail-type']);
  console.log('Time:', event.time);

  var AWS = require('aws-sdk');
  AWS.config.region = 'us-east-1';
  var s3bucket = new AWS.S3({params: {Bucket: config[process.env.AWS_LAMBDA_FUNCTION_NAME]['AWS_S3_BUCKET_NAME']}});

  /*
   *  Download XML File
   */
  var parseString = require('xml2js').parseString;
  var request = require('request');

  var xml_endpoint = config[process.env.AWS_LAMBDA_FUNCTION_NAME]['XML_ENDPOINT'];

  request.get(xml_endpoint, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var xml = body;
      parseString(xml, function(err, result) {
        console.log('Data from ' + xml_endpoint + ':');

        // Observed Measurements
        var obj_observed = []

        // for (var i=0; i < result.site.observed[0].datum.length; i++) {
        for (var i=0; i <= 1; i++) { 
          
          var datum = {
            'time': formatTheDate(result.site.observed[0].datum[i].valid[0]._),
            'timeSince': timeSince(result.site.observed[0].datum[i].valid[0]._),
            'depth': result.site.observed[0].datum[i].primary[0]._,
            'flow': result.site.observed[0].datum[i].secondary[0]._
          }
          obj_observed.push(datum);
        }

        // Forcasted Measurements
        var obj_forecast = []

        for (var i=0; i < result.site.forecast[0].datum.length; i++) {
          var datum = {
            'time': formatTheDate(result.site.forecast[0].datum[i].valid[0]._),
            'depth': result.site.forecast[0].datum[i].primary[0]._,
            'flow': result.site.forecast[0].datum[i].secondary[0]._
          }
          obj_forecast.push(datum);
        }

        var obj_json = {
          '_generated': formatTheDate(new Date()),
          '_source': xml_endpoint,
          'gaugeName': result.site['$'].name,
          'gaugeGenerationTime': formatTheDate(result.site['$'].generationtime),
          'observed': obj_observed,
          'forecast': obj_forecast
        }

        str_json = JSON.stringify(obj_json);
        str_jsonp = config[process.env.AWS_LAMBDA_FUNCTION_NAME]['JSONP_FUNCTION_NAME'] + '(' + str_json + ')';

        uploadJSON(str_jsonp);

      });
    } else {
      console.log(error);
      context.fail(error);
    }
  });

  function formatTheDate(timestamp) {
    var date = new Date(timestamp);

    var localTime  = moment.utc(date).toDate();
    var newYork = moment.tz(localTime, "America/New_York");
    var dateFormatted = moment(newYork).format('MMMM Do YYYY, h:mm:ss a');

    return dateFormatted;
  }

  function timeSince(timestamp) {
    var date = new Date(timestamp);

    var localTime  = moment.utc(date).toDate();
    var newYork = moment.tz(localTime, "America/New_York");

    var timeSince = moment(newYork).fromNow();

    return timeSince;
  }

  /*
   *  Upload JSON file
   */
  function uploadJSON(json_body) {
    var params = {
      Key: config[process.env.AWS_LAMBDA_FUNCTION_NAME]['AWS_S3_JSONP_KEY'],
      ACL: 'public-read',
      ContentType: 'application/javascript',
      Body: json_body
    };
    s3bucket.upload(params, function(err, data) {
      if(err) {
        console.log('Upload Error: ', err);
        context.fail('Upload Error: ' + err);
      }
      else {
        console.log('Generated JSONP: ')
        console.log(params.Body);
        console.log('Successfully uploaded', params.Key, 'to S3.');
        context.succeed(true);
      }
    });
  }
};
