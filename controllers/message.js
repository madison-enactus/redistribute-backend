//Requirements
var twilio = require('twilio');
var config = require('../config');
var myConfig = require('../myConfig.js');

//Create an authenticated Twilio REST API client
var client = require('twilio')(config.accountSid, config.authToken);

//global variables
  //the numberproperties object essentially duplicates the NumberTable. We
  //may not need it, since we might directly reference the NumberTable. For now
  //it provides a simple way to access this information.
  var numberproperties = {number:'', type:'', location:'', name:'', created:'',
                open:'', close:'', linkednumbers:'', storage:'',
                scheduledpickups:'', status:''};
  var message = '' //from request.body.Body, ie 'chicken, 30, 01/26 2200'

//COLUMNS FOR THE TABLES:
  //The NumberTable
  // number = '' //format +12628227987
  // type = '' //either RC, D, V, A, or U (rec. ctr, donor, vol, admin, or unknown)
  // location = '' //the address of the RC/Donor/Volunteer
  // name = '' //i.e 'UW Hosptial' or 'Porchlight' or 'Morty Smith'
  // created = '' //the date that the number was stored in the table, '1.26.17'
  // open = '' //time that the donor opens, the RC opens, the vol is first avail
  //           //i.e, 'M0800,H1700,S1230,U0900' for available starting
  //           //Monday at 8am, Thursday at 5pm, Sat. at 12:30p , and Sun. at 9am
  // close = '' //same idea as open, but for close times/volunteer no longer avail
  // linkednumbers = '' //used to tie donors to volunteers and RC's,
  //                    // i.e. 'V+12628227897,RC+12628227897' or 'RC+12628227897'
  //                    // to tie both a vol and RC to a donor, or just an RC
  // storage = '' //either Y or N, denoting whether the donor, RC, or vol can store
  //              // donations overnight at their location
  // scheduledpickups = '' //allow donors, volunteers, and RC's to be texted at
  //                       //specific times for scheduled, consistant donations
  // status = '' //either IP (In process) or NEW (Not in Process) to denote whether
  //             //the volunteer/RC/donor is currently working on a donations
  //
  // //The DonationsTable
  // donationID = '' //the unique ID associated with a donations
  // donorName = '' //i.e. 'Banzo Madison'
  // rcName = '' //i.e. 'UW Financial Aid Office'
  // volName = '' //i.e. 'Jason Funderburger'
  // lbs = '' //the integer weight of the donation in pounds, ie '30'
  // type = '' //the type of food being donated, ie 'Meat'
  // recievied = '' //the date & time the donatoin was recieved, ie '01.26.17.0900'
  // deadline = '' // the date & time deadline for pickup ie '01.26.17.1930'
  // status = '' //either O, C, P, or D for open, closed, picked up, or dropped,
  //             // representing a donation that has been proposed but no RC or no
  //             // vol, a don. with a vol and RC but no confirmation of pickup, a
  //             // donation with confirmed pickup, and a dropped donation.
  // value = '' //the value of the donation, as determined by its weight & category
  // details = '' //any special details associated with the donation
  //
  // //The MessagesTable
  // number = '' //the number the message was recieved from, ie '+12628227897'
  // message = '' //the text of the message
  // dateandtime = '' //ie '1.26.17.1449' for Jan. 26 2017 at 2:49 PM

//First, capture and store the message. Then, redirect to the relavent
//  process depending on whether the number is donor, volunteer, RC, or other
exports.storeandredirect = function(request, response) {

  //store the temporary number and message variables
  numberproperties.number = request.body.From;
  message = request.body.Body;

  //TODO: Store the message in the MessagesTable

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

  //TODO: cycle through NumberTable and see if the number is a donor's

  return true
}

//returns true if the number is an RC's number
numberIsRC = function(number) {

  //TODO: cycle through NumberTable and see if the number is an RC's

  return true
}

//returns true if the number is a volunteer's number
numberIsVolunteer = function(number) {

  //TODO: cycle through NumberTable and see if the number is a volunteer's

  return true
}

//processes donor texts
processDonor = function() {
  //if the donor is creating a new donation, ie this is the first text we get,
  //number.status (represents the status variable associated with the number in
  //the NumberTable) will equal 'NEW', the default
  if numberproperties.status = 'NEW' {
    if inDonationFormat() {
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

      }
      else if (message == 'DONE') {

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
