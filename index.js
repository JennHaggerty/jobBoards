var jsdom = require("jsdom"); 
var $ = require("jquery")(jsdom.jsdom().defaultView); 
//var $ = require('cheerio');
var config = require('./config');
var jobBoards = config.jobBoards;
var whiteList = config.whiteList;
var request = require('request');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var base64 = require('base-64');
var nodemailer = require('nodemailer');
var password = config.password;
// we want to get the decoded password into a var
password = base64.decode(password);

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
  user: config.gmail,
  pass: password
  }
});


// if PASSWORD env.var is missing, exit the program
if(!config) {
  console.log("You need a config/ file!");
  process.exit(1);
}
function myProgram() {
  // iterates(counts through) the jobBoards array
  for (var i = 0; i < jobBoards.length; i++) {
    // requesting remote job board from url (jobBoards[i])
    request(jobBoards[i], function (error, response, body) {
      //if error occurs, spits out error to log
      if(error) {
        console.log(error);
      }
      if (!error && response.statusCode == 200) {
        // converts xml to json string
        parseString(body, function (err, result) {
          // if error occurs, stop loop iteration
          if(err) return console.log(err);
          // accessing item attributes of "result" object
          var jobs = result.rss.channel[0].item;
          // loop through jobs
          for (var j = 0; j < jobs.length; j++) {
            var job = jobs[j];
            jobProcessor(job);
          }
        });
      }
    });
  }
}

function jobProcessor(job) {
  var title = job.title[0];
  var link = job.link[0];
  var desc = job.description[0];

  // loop through whiteList to check job description
  for (var k = 0; k < whiteList.length; k++) {
    var whiteListItem = whiteList[k];
    // log job title if job description has whiteListItem 
    if(desc.indexOf(whiteListItem) > -1) {
      //html is html page for a matching job
      request(link, function (error, response, html) {
console.log("::::::::::::::::::");
console.log("::::::::::::::::::");
console.log("::::::::::::::::::");
        //if error occurs, spits out error to log
        if(error) {
          console.log(error);
        }
        if (!error && response.statusCode == 200) {
          var $html  = $(html);
          var $apply = $html.find(".apply");
          var apply = $apply.html();
          //find email if there is one on job page HTML
          var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
          var matches = apply.match(re);

          if(!matches) {
            console.log("No email address included");
            console.log("Sending link via email...");
            console.log('link: ', link);

              //TODO Find emails: follow apply link to employer website, pull email
              //Sends email with job description for HTML pages without employer email
//            transporter.sendMail({
//              from: config.gmail,
//              to: config.gmail,
//              subject: 'job',
//              text: link
//            });
          } else {
            for (var l = 0; l < matches.length; l++) {
              //TODO create emails for applications
              var emailMatch = matches[l];
              console.log(emailMatch);
            }
          }
        } 
      });
    }
  }
}

setInterval(function() {
  myProgram();
  console.log("I'm alive.");
}, 86400000); //one day in milliseconds

//TODO write a Jobs Applied file to save previously applied for jobs and take them out
//out of the program so they don't keep getting emailed over everyday
myProgram();
