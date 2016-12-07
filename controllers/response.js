var twilio = require('twilio');
var config = require('../config');
var myConfig = require('../myConfig.js');

// Create an authenticated Twilio REST API client
var client = require('twilio')(config.accountSid, config.authToken);

//module variables
var rc_blurb = '';
var donor = '';
var donor_address = '';
var dont_repeat = 0;

getDonor = function(number) {
  //look up donor name in our table
  donorname = 'Test Donor';
  return donorname;
};

getDonorAddress = function(number) {
  //look up donor address in our table
  donoraddy = 'Test Address';
  return donoraddy;
};

converttoRC = function(food, quantity, deadline, addinfo) {
  if (addinfo === null) {
    morestuff = '';
  } else {
      morestuff = addinfo;
  }

  rc_blurb = (donor + ' has ' +
    quantity + ' lbs of ' + food + ' that needs to be picked up by ' +
    deadline + ' at ' + donor_address + '.' + morestuff);

};

//returns true if it's in the correct donation format
isdonationformat = function(input) {
  //split text into an array of comma seperated pieces
  var temp = [];
  temp = input.split(",");

  //food type is before the first comma
  var food = temp[0];
  //quantity is before the second comma
  var quantity = temp[1];
  //remove all white space that may surround the quantity and converts to a #
  quantity = quantity.replace(/\s/g,'');
  quantity = parseInt(quantity, 10);
  //deadline is final or before the third comma
  var deadline = temp[2];
  //additional info is after the third comma, if it exists
  var addinfo = temp[3];

  if (temp.length > 2 && temp.length < 5) {
    if (Number.isInteger(quantity)) {
      converttoRC(food, quantity, deadline, addinfo);
      return true;
    }
    return false;
  }
  return false;
};

//returns true if it's an authorized number
isauthorizednumber = function(authorizednum) {
  //run through our database of authorized numbers
  //if one matches, return true
  //else return false
  return true;
};

sendoutmessage = function(tonumber, messagebody) {
client.sendMessage({
      to: tonumber,
      from: myConfig.twilioNumber,
      body: messagebody,
  });
};

// capture the text
exports.createsomething = function(request, response) {
if (dontrepeat == 1) {
//store variables
donor = getDonor(request.body.From);
donor_address = getDonorAddress(request.body.From);
//check if it's a donation
    if (isdonationformat(request.body.Body)) {
      //checks number against list of authorized numbers
      if (isauthorizednumber(request.body.From)) {
        //notifies all RC's via text
        var rcnumber = myConfig.myNumber;
        sendoutmessage(rcnumber, rc_blurb);
        //sends a thank you text
        var tybody = ('Thank you for your donation to Project Redistribute.' +
            ' We have notified all charities and will get back to you soon.' +
            ' Please wait to respond until we do, otw call 2628227897 w/ questions');
        //sendoutmessage(request.body.From, tybody);
      }
    }
}
dontrepeat = 1;
};
