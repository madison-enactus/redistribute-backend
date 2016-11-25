var twilio = require('twilio');
var config = require('../config');
var myConfig = require('../myConfig.js');

// Create an authenticated Twilio REST API client
var client = require('twilio')(config.accountSid, config.authToken);

//module variables
var rcblurb = 'penis';
var donor = '';
var donoraddress = '';
var dontrepeat = 0;

getDonor = function(number) {
  //look up donor name in our table
  donorname = 'Test Donor';
  return donorname;
}

getDonorAddress = function(number) {
  //look up donor address in our table
  donoraddy = 'Test Address';
  return donoraddy;
}

converttoRC = function(food, quantity, deadline, addinfo) {
  if (addinfo == null) {
    morestuff = ''
  } else {
      morestuff = addinfo;
  };

  rcblurb = (donor + ' has ' +
    quantity + ' lbs of ' + food + ' that needs to be picked up by ' +
    deadline + ' at ' + donoraddress + '.' + morestuff);

};

//returns true if it's in the correct donation format
isdonationformat = function(input) {
  //split text into an array of comma seperated pieces
  var temp = new Array();
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
    };
    return false;
  };
  return false;
};

//returns true if it's an authorized number
isauthorizednumber = function(authorizednum) {
  //run through our database of authorized numbers
  //if one matches, return true
  //else return false
  return true
};

sendoutmessage = function(tonumber, messagebody) {
client.sendMessage({
      to: tonumber,
      from: myConfig.twilioNumber,
      body: messagebody,
  })
};

// capture the text
exports.createsomething = function(request, response) {
if (dontrepeat == 1) {
//store variables
donor = getDonor(request.body.From);
donoraddress = getDonorAddress(request.body.From);
//check if it's a donation
    if (isdonationformat(request.body.Body)) {
      //checks number against list of authorized numbers
      if (isauthorizednumber(request.body.From)) {
        //notifies all RC's via text
        var rcnumber = myConfig.myNumber;
        sendoutmessage(rcnumber, rcblurb);
        //sends a thank you text
        var tybody = ('Thank you for your donation to Project Redistribute.'
        + ' We have notified all charities and will get back to you soon.'
        + ' Please wait to respond until we do, otw call 2628227897 w/ questions');
        //sendoutmessage(request.body.From, tybody);
      };
    };
}
dontrepeat = 1;
};

// Render a form that will allow the user to send a text (or picture) message
// to a phone number they entered.
exports.showSendMessage = function(request, response) {
    response.render('sendMessage', {
        title: 'Sending Messages with Twilio'
    });
};

// Handle a form POST to send a message to a given number
exports.defaultmessagesend = function(request, response) {

};

// Show a page displaying text/picture messages that have been sent to this
// web application, which we have stored in the database
exports.showReceiveMessage = function(request, response) {
    console.log(request);
};

// Handle a POST request from Twilio for an incoming message
exports.receiveMessageWebhook = function(request, response) {

};

// Update the configured Twilio number for this demo to send all incoming
// messages to this server.
exports.configureNumber = function(request, response) {

};
