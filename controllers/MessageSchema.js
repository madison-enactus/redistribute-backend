var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// //The MessageTable
// number = '' //the number the message was recieved from, ie '+12628227897'
// message = '' //the text of the message
// dateandtime = '' //ie '1.26.17.1449' for Jan. 26 2017 at 2:49 PM

// create a schema
var messageSchema = new Schema({
  number: String, //the number the message was recieved from, ie '+12628227897'
  message: String, //the text of the message
  dateandtime: String //ie '1.26.17.1449' for Jan. 26 2017 at 2:49 PM
});

//if we need it...
messageSchema.methods.customMethod1 = function() {
  // add some stuff to the users name
};

// the schema is useless so far
// we need to create a model using it
var MessageTable = mongoose.model('MessageTable', messageSchema);


// make this available to our users in our Node applications
module.exports = MessageTable;
