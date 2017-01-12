//Requirements
var twilio = require('twilio');
var config = require('../config');
var myConfig = require('../myConfig.js');
//the tables
var number = require('../controllers/NumberSchema.js')
var donation = require('../controllers/DonationSchema.js')
var message = require('../controllers/MessageSchema.js')

//Create an authenticated Twilio REST API client
var client = require('twilio')(config.accountSid, config.authToken);

//global variables
  var numberproperties = {
    number:'',
    type:'',
    location:'',
    name:'',
    created:'',
    open:'',
    close:'',
    linkednumbers:'',
    storage:'',
    scheduledpickups:'',
    status:''
  };

  var message = '' //from request.body.Body, ie 'chicken, 30, 01/26 2200'

//First, capture and store the message. Then, redirect to the relavent
//  process depending on whether the number is donor, volunteer, RC, or other
exports.storeandredirect = function(request, response) {

  //store the temporary number and message variables
  numberproperties.number = request.body.From;
  message = request.body.Body;

  //Store the message in the MessagesTable
  storeMessage(message);

  //Redirects to the appropriate V, RC, D, or U function
  if (numberIsDonor(numberproperties.number)) {
    processDonor();
  } else if (numberIsRC(numberproperties.number)) {
    processRC();
  } else if (numberIsVolunteer(numberproperties.number)) {
    processVolunteer();
  } else {
    processUnknown();
  };
};

//returns true if the number is a donor's number
numberIsDonor = function(number) {
    //find the number in the NumberTable
    number.find({number: numberproperties.number}, function(err, user) {
      if (err) return false;

      // if the type is D, return true
      if (number.type == 'D') {
        //set all the numberproperties variables and return true
        numberproperties.number = number.number;
        numberproperties.type = number.type;
        numberproperties.location = number.location;
        numberproperties.name = number.name
        numberproperties.created = number.created
        numberproperties.open = number.open;
        numberproperties.close = number.close;
        numberproperties.linkednumbers = number.linkednumbers;
        numberproperties.storage = number.storage;
        numberproperties.scheduledpickups = number.scheduledpickups;
        numberproperties.status = number.status;
        return true
      }
      else {
        return false
      }
    });
}

//returns true if the number is an RC's number
numberIsRC = function(number) {
  //find the number in the NumberTable
  number.find({number: numberproperties.number}, function(err, user) {
    if (err) return false;

    // if the type is RC, return true
    if (number.type == 'RC') {
      //set all the numberproperties variables and return true
      numberproperties.number = number.number;
      numberproperties.type = number.type;
      numberproperties.location = number.location;
      numberproperties.name = number.name
      numberproperties.created = number.created
      numberproperties.open = number.open;
      numberproperties.close = number.close;
      numberproperties.linkednumbers = number.linkednumbers;
      numberproperties.storage = number.storage;
      numberproperties.scheduledpickups = number.scheduledpickups;
      numberproperties.status = number.status;
      return true
    }
    else {
      return false
    }
  });
}

//returns true if the number is a volunteer's number
numberIsVolunteer = function(number) {
  //find the number in the NumberTable
  number.find({number: numberproperties.number}, function(err, user) {
    if (err) throw err;

    // if the type is V, return true
    if (number.type == 'V') {
      //set all the numberproperties variables and return true
      numberproperties.number = number.number;
      numberproperties.type = number.type;
      numberproperties.location = number.location;
      numberproperties.name = number.name
      numberproperties.created = number.created
      numberproperties.open = number.open;
      numberproperties.close = number.close;
      numberproperties.linkednumbers = number.linkednumbers;
      numberproperties.storage = number.storage;
      numberproperties.scheduledpickups = number.scheduledpickups;
      numberproperties.status = number.status;
      return true
    }
    else {
      return false
    }
  });
}

//processes donor texts
processDonor = function() {
  //if the donor is creating a new donation, ie this is the first text we get,
  //number.status (represents the status variable associated with the number in
  //the NumberTable) will equal 'NEW', the default
  if (numberproperties.status == 'NEW') {
    if (inDonationFormat()) {
      //TODO: create a new entry in the DonationsTable
      //TODO: notify all RC's within open/close times
      //TODO: notify all volunteers within open/close times
      messagetoadmins = 'Successful donation from ' + numberproperties.name +
        ': ' + message
      notifyadmins(messagetoadmins);
    }
    else if (message == 'HELP') {
      messagetoadmins = 'HELP request from ' + numberproperties.name
      notifyadmins(messagetoadmins);
      helpmessage = 'Thank you for contacting PR help. Admins have been notified'
      + ' and will get back to you shortly.'
      sendoutmessage(numberproperties.number, helpmessage);
    }
    else {
      errormessage = "Thank you for texting Project Redistribute. We didn't "
      + "understand that. Please donate in this format: food type, quantity in "
      + "lbs, pickup deadline, other details. For example: baked goods, 10, 1/28 "
      + "9pm, ask for Steve. If this fails, text HELP to notify admins."
      sendoutmessage(numberproperties.number, errormessage);
    }
  }
  //if the donor is in the process of a donation, ie the 2nd + texts we get
  else if (numberproperties.status == 'IP') {
    //if no RC's or volunteers have yet claimed the donation, the linkednumbers
    //field will be blank.
    if (numberproperties.linkednumbers == '') {
      inprocessmessage = 'Your donation is currently waiting for a recieving'
      + ' center and/or volunteer. You will be notified when it is claimed.'
      + ' Text HELP for more details.'
      sendoutmessage(numberproperties.number, inprocessmessage);
    }
    //if the linkednumbers field has a number, redirect the text to that number
    else {
      sendtolinked(message);
    }
  }
  //theoretically this should never be reached
  else {
    errormessage = 'There has been an error: ' + message
    notifyadmins(errormessage);
  }
}

//processes recieving center texts
processRC = function() {
  //If the RC is already linked to a donor, send to all linked numbers.
  //ie, if the RC is linked to a donor, send to both the donor and vol.
  //if the RC is linked to just a vol, this returns false.
  if (numberproperties.linkednumbers.includes("D")) {
    sendtolinked(message);
  }
  //if the RC is not linked to a donor, it has just recieved 'Can you claim?'
  //and should be marked as in process (IP)
  else {
    //if the RC is currently pending claim
    if (numberproperties.status == 'IP') {
      //if they respond yes
      if (message == 'YES') {
        //if the RC is linked to a permanent volunteer, ie someone who always
        //picks up donations for that donor
        if (numberproperties.linkednumbers.includes("PV")) {
          //TODO: clear any existing volunteers and notify them of the change;
          // they will not have to pick up food, since the RC has a PV
          //TODO: link the PV to the D
          //TODO: link the RC to the D
          //TODO: add the RC to the DonationsTable
          //TODO: reply to RC
          //TODO: notify the donor
          //TODO: reply to all other RC's still IP and change their status to NEW
          //TODO: change all volunteer status's to NEW
          //TODO: change donation status to C
        }
        //else if the Donor is linked to a (nonpermanent) volunteer, ie a
        //volunteer has agreed to transport the food.
        else if (donorIsLinkedTo("V")) {
          //TODO: link RC # to donor
          //TODO: linke RC to V
          //TODO: notify donor
          //TODO: notify volunteers still in proess
          //TODO: reply to RC
          //TODO: reply to all other RC's still IP; change their status to NEW
          //TODO: change donation status to C
          //TODO: add RC to donations table

        }
        //if no volunteer has yet agreed and there is no permanent volunteer
        else {
          //TODO: link RC # to donor
          //TODO: notify donor
          //TODO: notify volunteers still in process
          //TODO: reply to RC
          //TODO: reply to all other RC's still IP; change their status to NEW
          //TODO: add RC to DonationsTable
        }
      }
      if (message == 'NO') {
        thankyoumessage = 'Thank you for your response. You have been marked '
        + 'as unavailable.'
        sendoutmessage(numberproperties.number, thankyoumessage);
      }
      if (message == 'HELP') {
        messagetoadmins = 'IP RC' + numberproperties.name  + ' w/ no linked '
        + 'numbers sent: ' + message
        notifyadmins(messagetoadmins);
        errormessage = 'Thank you for contacting PR admins. We will contact you'
        + ' shortly.'
        sendoutmessage(numberproperties.number, errormessage)
      }
      else {
        messagetoadmins = 'IP RC' + numberproperties.name  + ' w/ no linked '
        + 'numbers sent: ' + message
        notifyadmins(messagetoadmins);
        errormessage = 'You are marked as pending claim. We expected YES or NO '
        + 'and your response did not match either. Please respond with either '
        + 'YES or NO or reply HELP to contact an admin.'
        sendoutmessage(numberproperties.number, errormessage)
      }
    }
    else {
      messagetoadmins = 'RC ' + numberproperties.name + 'has sent: "' + message
      + '" while not in process'
      notifyadmins(messagetoadmins);
    }
  }
}

//processes volunteer texts
processVolunteer = function() {
  //if the volunteer is already linked to a donor, send to linked numbers
  if (numberproperties.linkednumbers.includes("D")) {
    sendtolinked(message);
  }
  else {
    if (numberproperties.status == 'IP') {
      if (message == 'YES') {
        //if the donation already has a volunteer (theoretically never reached)
        if (donorIsLinkedTo("V")) {
          //let the volunteer know there is another volunteer
          messagetovolunteer = 'Someone else has agreed to volunteer, but thank '
          + 'you for the offer and your support!'
          sendoutmessage(numberproperties.number, messagetovolunteer);
          //correct the status to new
          numberproperties.status = 'NEW'
        }
        //if there is no existing volunteer and there is an RC
        else if (donorIsLinkedTo("RC")) {
          //TODO: notify donor
          //TODO: add volunteer to DonationsTable
          //TODO: notify RC
          //TODO: reply to volunteer
          //TODO: link volunteer to donor
          //TODO: link volunteer to RC
          //TODO: change all other volunteer status's to new
          //TODO: change donation status to "C"
        }
        //if there is no existing volunteer and there is no RC
        else {
          //TODO: link volunteer to donor
          //TODO: add volunteer to DonationsTable
          //TODO: notify donor
          //TODO: notify all RC's still IP
          //TODO: reply to volunteer
          //TODO: change all other volunteer status's to new
        }
      }
      else if (message == 'NO') {
        //TODO: change the volunteer status to new
        //TODO: reply to volunteer
      }
      else if (message == 'DONE') {
        //TODO: change all status's to new
        //TODO: change donation status to P
        //TODO: reply to volunteer
      }
      else if (message == 'HELP') {
        messagetoadmins = 'Vol ' + numberproperties.name + 'has sent: "' + message
        + '" while in process.'
        notifyadmins(messagetoadmins);
      }
      else {
        errormessage = 'Sorry, we were expecting "YES", "NO", or "DONE". If you'
        + ' need to contact admins, reply "HELP"'
        sendoutmessage(numberproperties.number, errormessage);
      }
    }
    else {
      messagetoadmins = 'Vol ' + numberproperties.name + 'has sent: "' + message
      + '" while not in process'
      notifyadmins(messagetoadmins);
    }
  }
}

//processes unknown texts. Could make this into a more sophisticated signup
//process down the line.
processUnknown = function() {
  messagetoadmins = numberproperties.number + ' sent: ' + message;
  notifyadmins(messagetoadmins);
  reply = 'Thank you for contacting Project Redistribute. It looks like you are'
  + ' not yet in our system. An admin will contact you shortly.'
  sendoutmessage(reply);
}

//sends messages
sendoutmessage = function(number, message) {
client.sendMessage({
      to: number,
      from: myConfig.twilioNumber,
      body: message,
  })
};

//notifies admins of errors or donations
notifyadmins = function(message) {
  //TODO: for each admin in NumberTable, call sendoutmessage with the msg body
}

//sends message to all linked numbers (donors, volunteers, or RC's)
sendtolinked = function(message) {
  //identify the sender
  this.message = numberproperties.name + 'sent: ' + this.message;
  //TODO: for each linked number, send the message
}

//returns true if the current donation (donation table: status) has a volunteer
//number / RC number field which isn't null
donorIsLinkedTo = function(code) {
  //TODO: cycle through donation table, return true if there is an entry
  //with an O or C status and a non-null volunteer/RC field (conditional on)
  //the value of *code*
}

//returns true if the message is in the correct donation format
inDonationFormat = function() {
  //creates an array of strings, each seperated by a comma in the message
  var temp = new Array();
  temp = message.split(",");
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
  //true if the number of comma-seperated strings is either 3 or 4
  if (temp.length > 2 && temp.length < 5) {
    //true if quantity is an integer
    if (Number.isInteger(quantity)) {
      return true;
    };
    return false;
  };
  return false;
  };

//stores messages in the MessageTable
  function storeMessage(message) {
    var newMessage = message({
      number: numberproperties.number,
      message: message,
      var now = new Date();
      dateandtime: now.getMonth() + '.' + now.getDate() + '.' +
        right(now.getFullYear(), 2) + '.' + now.getHours() + now.getMinutes()
    });

    // save the user
    newMessage.save(function(err) {
    if (err) throw err;

    console.log('User created!');
    });
  }
//returns the rightmost characters
  function right(str, chr)
  {
  return str.slice(myString.length-chr,myString.length);
  }
//returns the leftmost characters
  function left(str, chr)
  {
  return str.slice(0, chr - myString.length);
  }
//Functions in the template we may or may not delete later


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
