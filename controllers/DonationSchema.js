var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

// create a schema
var donationSchema = new Schema({
  donationID: Number, //the unique ID associated with a donations
  donorName: String, //i.e. 'Banzo Madison'
  rcName: String, //i.e. 'UW Financial Aid Office'
  volName: String, //i.e. 'Jason Funderburger'
  lbs: Number,  //the integer weight of the donation in pounds, ie '30'
  type: String, //the type of food being donated, ie 'Meat'
  recievied: String, //the date & time the donatoin was recieved, ie '01.26.17.0900'
  deadline: String, // the date & time deadline for pickup ie '01.26.17.1930'
  status: String, //either O, C, P, or D for open, closed, picked up, or dropped,
  //             // representing a donation that has been proposed but no RC or no
  //             // vol, a don. with a vol and RC but no confirmation of pickup, a
  //             // donation with confirmed pickup, and a dropped donation.
  value: Number, //the value of the donation, as determined by its weight & category
  details: String, //any special details associated with the donation
});

//if we need it...
donationSchema.methods.customMethod1 = function() {
  // add some stuff to the users name
};

// the schema is useless so far
// we need to create a model using it
var donation = mongoose.model('donation', donationSchema);


// make this available to our users in our Node applications
module.exports = donation;
