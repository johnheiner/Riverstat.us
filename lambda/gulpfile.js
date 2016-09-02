'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var rename = require('gulp-rename');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var runSequence = require('run-sequence');
var fs = require('fs');
var dotenv = require('dotenv');

// Placeholder ENV for now, override in deploy tasks
var ENVIRONMENT = './env/gulp.env.production';
var dist_file_name = "dist.zip";

gulp.task('clean', function() {
  return del(['./dist', './' + dist_file_name])
    .then(function(paths) {
      gutil.log('Deleted files and folders:\n', paths.join('\n'));
    });
});

//  Move the javascipt
gulp.task('js', function() {
  return gulp.src('index.js')
    .pipe(gulp.dest('./dist/'));
});

//  Install node modules
gulp.task('npm', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest('./dist/'))
    .pipe(install({production: true}));
});

//  Move config files
gulp.task('env', function() {
  return gulp.src(ENVIRONMENT)
    .pipe(rename('.env'))
    .pipe(gulp.dest('./dist/'))
});
gulp.task('config', function() {
  return gulp.src('./env/config.json')
    .pipe(rename('config.json'))
    .pipe(gulp.dest('./dist/'))
});

//  Zip the files up
gulp.task('zip', function() {
  return gulp.src(['dist/**/*', '!dist/package.json', 'dist/.*'])
  .pipe(zip(dist_file_name))
  .pipe(gulp.dest('./'));
});

// Upload the zip
gulp.task('updateFunction', function(cb) {

  AWS.config.region = process.env.AWS_REGION;
  var lambda = new AWS.Lambda();
  var functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

  return lambda.getFunction({FunctionName: functionName}, function(err, data) {
    if(err) {
      if (err.statusCode === 404) {
        var warning = 'Unabled to fine lambda function ' + functionName + '. ';
        warning += 'Verify the lambda function name and AWS region are correct.';
        gutil.log(warning);
      } else {
        gutil.log(err);
      }
    } else {
      gutil.log('Lambda Function Found: ', process.env.AWS_LAMBDA_FUNCTION_NAME)
    }

    var current = data.Configuration;
    fs.readFile(dist_file_name, function(err, data) {
        var params = {
          FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
          Publish: true,
          ZipFile: data
        };

        lambda.updateFunctionCode(params, function(err, data) {
          if (err) {
            gutil.log(err);
          } else {
            gutil.log('Lambda Update Function Code Complete: ', process.env.AWS_LAMBDA_FUNCTION_NAME);
            cb();
          }
        });
      });
  });

});

/*
 *  Deply to production locally
 */
gulp.task('deploy_production', function(callback) {

  // Load Production environment
  ENVIRONMENT = './env/gulp.env.production';
  dotenv.config({path: ENVIRONMENT});

  // Pull the dist filename from the environment
  dist_file_name = process.env.DEV_DIST_FILENAME;

  runSequence(
    ['clean'],
    ['js', 'npm', 'env', 'config'],
    ['zip'],
    ['updateFunction'],
    callback
  );
});

/*
 *  Invoke remote lambda function so we don't have to login and hit test.
 *  DONT USE THIS YET
 */
gulp.task('invoke_remote', function(cb) {
  AWS.config.region = process.env.AWS_REGION;
  var lambda = new AWS.Lambda();
  var functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

  var params = {
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    InvocationType: 'RequestResponse',
    LogType: 'Tail'
  }

  lambda.invoke(params, function(err, data) {
    if (err) {
      gutil.log(err);
    } else {
      gutil.log('Operation Successful');
      gutil.log('Status Code:', data.StatusCode);
      gutil.log('----- Begin Lambda Log Output -----');
      gutil.log(new Buffer(data.LogResult, 'base64').toString('ascii'));
      gutil.log('----- End Lambda Log Output -----');
      cb();
    }
  });
});
