//Requirements
var twilio = require('twilio');
var config = require('../config');
var myConfig = require('../myConfig.js');
//the tables
var NumberTable = require('../controllers/NumberSchema.js')
var DonationTable = require('../controllers/DonationSchema.js')
var MessageTable = require('../controllers/MessageSchema.js')

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
  if ( numberIsDonor(numberproperties.number) ) {
    //processDonor is now called from within numberIsDonor
  } else if (numberIsRC(numberproperties.number)) {
    //processRC is now called from within numberIsRC
  } else if (numberIsVolunteer(numberproperties.number)) {
    //processV is now called from within numberIsV
  } else if (creating()) {
      //if the user is signing up, split into csv and make a new entry in NumberTable
      var temp = new Array();
      temp = message.split(",");
      for (var i = 0; i < temp.length; i++) {
        temp[i] = temp[i].replace(/\s/g,'');
      }
      //(num, type, location, name, open, close, linkednumbers, storage, scheduledpickups)
      makeNumber(numberproperties.number, temp[1], temp[2], temp[3], temp[4], temp[5], temp[6], temp[7], temp[8]);
  }
  else {
    processUnknown();
  };
};

//returns true if the number is a donor's number
numberIsDonor = function(num) {
    //find the number in the NumberTable
    return NumberTable.findOne({ number: num }, function(err, numtable) {
      if (err) throw console.error();

      // if the type is D, return true
      if (numtable.type === "D") {
        //set all the numberproperties variables and return true
        numberproperties.number = numtable.number;
        numberproperties.type = numtable.type;
        numberproperties.location = numtable.location;
        numberproperties.name = numtable.name
        numberproperties.created = numtable.created
        numberproperties.open = numtable.open;
        numberproperties.close = numtable.close;
        numberproperties.linkednumbers = numtable.linkednumbers;
        numberproperties.storage = numtable.storage;
        numberproperties.scheduledpickups = numtable.scheduledpickups;
        numberproperties.status = numtable.status;
        //call the donor function if true
        processDonor();
      }
      else {
        return false;
      }
    });
}

//returns true if the number is an RC's number
numberIsRC = function(num) {
  //find the number in the NumberTable
  return NumberTable.findOne({ number: num }, function(err, numtable) {
    if (err) throw err;

    // if the type is RC, return true
    if (numtable.type === 'RC') {
      //set all the numberproperties variables and return true
      numberproperties.number = numtable.number;
      numberproperties.type = numtable.type;
      numberproperties.location = numtable.location;
      numberproperties.name = numtable.name
      numberproperties.created = numtable.created
      numberproperties.open = numtable.open;
      numberproperties.close = numtable.close;
      numberproperties.linkednumbers = numtable.linkednumbers;
      numberproperties.storage = numtable.storage;
      numberproperties.scheduledpickups = numtable.scheduledpickups;
      numberproperties.status = numtable.status;
      processRC();
      return true
    }
    else {
      return true
    }
  });
}

//returns true if the number is a volunteer's number
numberIsVolunteer = function(num) {
  //find the number in the NumberTable
  return NumberTable.findOne({number: num}, function(err, numtable) {
    if (err) throw err;

    // if the type is V, return true
    if (numtable.type == 'V') {
      //set all the numberproperties variables and return true
      numberproperties.number = numtable.number;
      numberproperties.type = numtable.type;
      numberproperties.location = numtable.location;
      numberproperties.name = numtable.name
      numberproperties.created = numtable.created
      numberproperties.open = numtable.open;
      numberproperties.close = numtable.close;
      numberproperties.linkednumbers = numtable.linkednumbers;
      numberproperties.storage = numtable.storage;
      numberproperties.scheduledpickups = numtable.scheduledpickups;
      numberproperties.status = numtable.status;
      processVolunteer();
      return true
    }
    else {
      return false
    }
  });
}

//determine whether we are adding something to the NumberTable
creating = function() {
  if (left(message, 3) === 'ADD') {
    return true
  }
  else {
    return false
  }
}

//processes donor texts
processDonor = function() {
  //if the donor is creating a new donation, ie this is the first text we get,
  //number.status (represents the status variable associated with the number in
  //the NumberTable) will equal 'NEW', the default
  if (numberproperties.status === 'NEW') {
    if (inDonationFormat()) {
      //add a line to DonationTable
        //done in inDonationFormat
      //notify all RC's within open/close times
        //iterate through each RC in the NumberTable
        NumberTable.find({type: 'RC'}).stream()
          .on('data', function(num){
            //find the donation properties
            DonationTable.findOne({status: 'O'}, function(err, don) {
              if (err) console.log('yfu');
              //message the RC's w/ the donation info
              messagetoRC = numberproperties.name + ' has donated ' + don.lbs +
                ' lbs of ' + don.type + ' to be picked up by ' + don.deadline + '. Do '
                + 'you have clients who could use it? Reply YES if yes, NO if no.'
              sendoutmessage(num.number, messagetoRC);
            });
          })
          .on('error', function(err){
            // handle error
          })
          .on('end', function(){
            // final callback
          });
      //Notify all volunteers within open/close times
        //iterate through each RC in the NumberTable
        NumberTable.find({type: 'V'}).stream()
          .on('data', function(num){
            //find the donation properties
            DonationTable.findOne({status: 'O'}, function(err, don) {
              if (err) console.log('yfu');
              //message the RC's w/ the donation info
              messagetoV = numberproperties.name + ' has donated ' + don.lbs +
                ' lbs of ' + don.type + ' to be picked up by ' + don.deadline +
                + ' from ' + don.location + '. Can you pick it up?'
              sendoutmessage(num.number, messagetoRC);
            });
          })
          .on('error', function(err){
            // handle error
          })
          .on('end', function(){
            // final callback
          });
      //notify admins of a succesful donation
      messagetoadmins = 'Successful donation from ' + numberproperties.name +
        ': ' + message
      notifyadmins(messagetoadmins);
    }
    else if (message === 'HLP') {
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
      + "9pm, ask for Steve. If this fails, text HLP to notify admins."
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
      + ' Text HLP for more details.'
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
      if (message == 'HLP') {
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
        + 'YES or NO or reply HLP to contact an admin.'
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
      else if (message == 'HLP') {
        messagetoadmins = 'Vol ' + numberproperties.name + 'has sent: "' + message
        + '" while in process.'
        notifyadmins(messagetoadmins);
      }
      else {
        errormessage = 'Sorry, we were expecting "YES", "NO", or "DONE". If you'
        + ' need to contact admins, reply "HLP"'
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
  sendoutmessage(numberproperties.number, reply);
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
  console.log(message);
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
  if (quantity != null) {
    quantity = quantity.replace(/\s/g,'');
    quantity = parseInt(quantity, 10);
  }
  //deadline is final or before the third comma
  var deadline = temp[2];
  //additional info is after the third comma, if it exists
  var addinfo = temp[3];
  //true if the number of comma-seperated strings is either 3 or 4
  if (temp.length > 2 && temp.length < 5) {
    //true if quantity is an integer
    if (Number.isInteger(quantity)) {
      //create an entry in the table
      makeDonation(quantity, food, deadline, addinfo);
      return true;
    };
    return false;
  };
  return false;
  };

//stores messages in the MessageTable
  function storeMessage(message) {
    var currentTime = new Date();
    var newMessage = MessageTable({
      number: numberproperties.number,
      message: message,
      dateandtime: (currentTime.getMonth() + 1) + '.' + currentTime.getDate() + '.' +
        right(currentTime.getFullYear(), 2) + '.' + currentTime.getHours() + currentTime.getMinutes()
    });

    // save the user
    newMessage.save(function(err) {
    if (err) throw err;

    console.log('Message created!');

    });
  }

//create a number entry in the NumberTable
  function makeNumber(num, type, location, name, open, close, linkednumbers, storage, scheduledpickups) {
    var currentTime = new Date();
    var newNumber = NumberTable({
      number: num, //format +12628227987
      type: type, //either RC, D, V, A, or U (rec. ctr, donor, vol, admin, or unknown)
      location: location, //the address of the RC/Donor/Volunteer
      name: name,  //i.e 'UW Hosptial' or 'Porchlight' or 'Morty Smith'
      created: (currentTime.getMonth() + 1) + '.' + currentTime.getDate() + '.' +
        right(currentTime.getFullYear(), 2) + '.' + currentTime.getHours() + currentTime.getMinutes(),
      open: open,
      close: close, //same idea as open, but for close times/volunteer no longer avail
      linkednumbers: linkednumbers,
      storage: storage,
      scheduledpickups: scheduledpickups,
      status: 'NEW'
    });

    // save the user
    newNumber.save(function(err) {
    if (err) throw err;

    console.log('Number created!');

    });
  }

  function makeDonation(lbs, type, deadline, details) {
    var currentTime = new Date();
    var newDonation = DonationTable({
      donationID: Math.random()*10000000, //the unique ID associated with a donations
      donorName: numberproperties.name, //i.e. 'Banzo Madison'
      rcName: '', //i.e. 'UW Financial Aid Office'
      volName: '',  //i.e. 'Jason Funderburger'
      lbs: lbs, //the integer weight of the donation in pounds, ie '30'
      type: type, //the type of food being donated, ie 'Meat'
      //the date & time the donatoin was recieved, ie '01.26.17.0900'
      recieved: (currentTime.getMonth() + 1) + '.' + currentTime.getDate() + '.' +
        right(currentTime.getFullYear(), 2) + '.' + currentTime.getHours() + currentTime.getMinutes(),
      deadline: deadline, // the date & time deadline for pickup ie '01.26.17.1930'
      status: 'O', //either O, C, P, or D for open, closed, picked up, or dropped,
      //             // representing a donation that has been proposed but no RC or no
      //             // vol, a don. with a vol and RC but no confirmation of pickup, a
      //             // donation with confirmed pickup, and a dropped donation.
      value: getValue(lbs, type), //the value of the donation, as determined by its weight & category
      details: details, //any special details associated with the donation
      location: numberproperties.location
    });

    // save the user
    newDonation.save(function(err) {
    if (err) throw err;

    console.log('Donation created!');

    });
  }

  //grab those leftmost chars
  function left(str, n){
  	if (n <= 0)
  	    return "";
  	else if (n > String(str).length)
  	    return str;
  	else
  	    return String(str).substring(0,n);
  }
  //grab those rightmost chars
  function right(str, n){
      if (n <= 0)
         return "";
      else if (n > String(str).length)
         return str;
      else {
         var iLen = String(str).length;
         return String(str).substring(iLen, iLen - n);
      }
  }

  //determines value by the type and weight
  function getValue(lbs, type){
    //TODO: make this a little more sophisticated
    return lbs*2
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
