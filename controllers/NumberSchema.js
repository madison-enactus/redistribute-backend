// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

// create a schema
var numberSchema = new Schema({
  number: String, //format +12628227987
  type: String, //either RC, D, V, A, or U (rec. ctr, donor, vol, admin, or unknown)
  location: String, //the address of the RC/Donor/Volunteer
  name: String,  //i.e 'UW Hosptial' or 'Porchlight' or 'Morty Smith'
  created: String, //the date that the number was stored in the table, '1.26.17'
  open: String, //time that the donor opens, the RC opens, the vol is first avail
             //i.e, 'M0800,H1700,S1230,U0900' for available starting
             //Monday at 8am, Thursday at 5pm, Sat. at 12:30p , and Sun. at 9am
  close: String, //same idea as open, but for close times/volunteer no longer avail
  linkednumbers: String,//used to tie donors to volunteers and RC's,
                      // i.e. 'V+12628227897,RC+12628227897' or 'RC+12628227897'
                      // to tie both a vol and RC to a donor, or just an RC
  storage: String, //either Y or N, denoting whether the donor, RC, or vol can store
                   // donations overnight at their location
  scheduledpickups: String, //allow donors, volunteers, and RC's to be texted at
                            //specific times for scheduled, consistant donations
  status: String, //either IP (In process) or NEW (Not in Process) to denote whether
                  //the volunteer/RC/donor is currently working on a donations
});

//if we need it...
numberSchema.methods.customMethod1 = function() {
  // add some stuff to the users name
};

// the schema is useless so far
// we need to create a model using it
var number = mongoose.model('number', numberSchema);


// make this available to our users in our Node applications
module.exports = number;
