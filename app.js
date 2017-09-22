require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var __ = require('underscore');

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
      "Url": session.message.attachments[0].contentUrl
    }
  }

  request.post(options, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      console.log(JSON.stringify(response.body));
      var predictions = response.body.Predictions;
      var mostSimilarPrediction = __.max(predictions, function(predictions){ return predictions.Probability; });
      var tag = mostSimilarPrediction.Tag;
      var lineName = "";
      var lineCode = "";

      switch (tag) {
        case "Chuo_Sobu":
          lineName = "ＪＲ中央・総武線各駅停車";
          lineCode = "110";
          break;
        case "Chuo_Ex":
          lineName = "ＪＲ中央線快速";
          lineCode = "109";
          break;
        case "Keihin-Tohoku":
          lineName = "ＪＲ京浜東北線";
          lineCode = "115";
          break;
        case "Tokaido":
          lineName = "ＪＲ東海道本線";
          lineCode = "117";
          break;
        case "Yamanote":
          lineName = "ＪＲ山手線";
          lineCode = "113";
          break;
        case "Yokosuka_SobuEx":
          lineName = "ＪＲ横須賀線";
          lineCode = "116";
          break;
      }

      session.send("%s に、いちばんにてるね！", lineName);

      var url = encodeURI("http://api.ekispert.jp/v1/json/station?operationLineCode=" + lineCode + "&key=" + process.env.EKISPERT_ACCESS_KEY)
      var options = {
        url: url,
        json: true
      }

      request.get(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {

          session.send("%s は、以下のえきをはしるよ。", lineName);

          var stations = response.body.ResultSet.Point;
          var stationNames = [];
          for(var i=0; i<stations.length; i++) {
            stationNames.push(stations[i].Station.Name);
          }
          session.send("%s", stationNames.join(' → '));
        } else {
          console.log("error: " + error);
        }
      })
    } else {
      console.log("error: " + error);
    }
  })
});
