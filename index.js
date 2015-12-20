var config = require('./config');
var jobBoards = config.jobBoards;
var whiteList = config.whiteList;
var request = require('request');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var base64 = require('base-64');
var nodemailer = require('nodemailer');
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

// if we get this far, PASSWORD is present. otherwise
// we would have exited in the line above.
var password = config.password;
// we want to get the decoded password into a var
password = base64.decode(password);


// iterates(counts through) the jobBoards array
for (var i = 0; i < jobBoards.length; i++) {
  //console.log(jobBoards[i]);
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
          var title = job.title[0];
          var link = job.link[0];
          var desc = job.description[0];
          // loop through whiteList to check job description
          for (var k = 0; k < whiteList.length; k++) {
            var whiteListItem = whiteList[k];
            // log job title if job description has whiteListItem 
            if(desc.indexOf(whiteListItem) > -1) {
              //console.log(link);
              // TODO have email sent to user
              request(link, function (error, response, body) {
                //if error occurs, spits out error to log
                if(error) {
                  console.log(error);
                }
                if (!error && response.statusCode == 200) {
                  //body is html page for a matching job
//                  console.log(body);
                  //TODO use jquery for apply link
                  //TODO follow apply link and apply
                  console.log("Sending email...");
                  transporter.sendMail({
                      from: 'sender@address',
                      to: config.gmail,
                      subject: 'hello',
                      text: 'hello world!'
                  });
                } 
              });
            }
          }
        }
      });
    }
  });
}
