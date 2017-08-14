var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {

  var options = {
    uri: process.env.CUSTOM_VISION_API_ENDPOINT,
    headers: {
      "Content-Type": "application/json",
      "Prediction-Key": process.env.CUSTOM_VISION_PREDICTION_KEY
    },
    json: {
      "Url": "http://anime.geocities.jp/grysk171/railwayyamanoteline_e231_500_13.jpg"
    }
  }
  request.post(options, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      console.log(JSON.stringify(response.body));
    } else {
      console.log("error: ");
    }
  })

  session.send("You said: %s", session.message.text);

});
