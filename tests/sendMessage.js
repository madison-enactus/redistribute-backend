// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var accountSid = 'ACb0d69e286cd952769ff0b5679c4d592a';
var authToken = "876162c5da1f949f1a17f5c9a1626a6d";
var client = require('twilio')(accountSid, authToken);

client.messages.create({
    body: "All in the game, yo",
    to: "+12624563621",
    from: "+15005550006"
}, function(err, sms) {
    process.stdout.write(sms.body);
    process.stdout.write("\n");
});
