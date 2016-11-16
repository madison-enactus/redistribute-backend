var myConfig = require('./myConfig.js');
var cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// Username/pass to protect demo pages for this app. This application can send
// messages and make calls for your account, so we don't want just anyone doing
// it!
cfg.basic = {
    username: process.env.HTTP_BASIC_USERNAME || 'admin',
    password: process.env.HTTP_BASIC_PASSWORD || 'password'
};

// A random string that will help generate secure one-time passwords and
// HTTP sessions
cfg.secret = process.env.APP_SECRET || 'keyboard cat';

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
cfg.accountSid = myConfig.testAccountSid;
cfg.authToken = myConfig.testAuthToken;

// A Twilio number you control - choose one from:
// https://www.twilio.com/user/account/phone-numbers/incoming
// Specify in E.164 format, e.g. "+16519998877"
cfg.twilioNumber = myConfig.twilioNumber;

// Your own mobile phone number! The app will be calling and texting you to
// test things out. Specify in E.164 format, e.g. "+16519998877"
cfg.myNumber = myConfig.myNumber;

// MongoDB connection string - MONGO_URL is for local dev,
// MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
cfg.mongoUrl = myConfig.mLabURI || 'mongodb://localhost/myapp'

// Export configuration object
module.exports = cfg;
