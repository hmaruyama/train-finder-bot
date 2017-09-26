var restify = require('restify');
var builder = require('botbuilder');

require('dotenv').config();
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

  if(session.message.attachments.length > 0) {

    var lineName = ""; // 駅すぱあと運航路線名
    var lineCode = ""; // 駅すぱあと運航路線コード
    var tag = ""; // カテゴリータグ
    var stations = []; // 路線停車駅情報(名前、緯度経度、都道府県..etc)リスト
    var stationNames = []; // 路線停車駅名リスト

    var customVisionApiRequestOptions = {
      uri: process.env.CUSTOM_VISION_API_URI,
      headers: {
        "Content-Type": "application/json",
        "Prediction-Key": process.env.CUSTOM_VISION_PREDICTION_KEY
      },
      json: {
        "Url": session.message.attachments[0].contentUrl
      }
    }

    // Custom Vision API へのPOSTリクエスト
    request.post(customVisionApiRequestOptions, function (error, response, body) {
      if(!error && response.statusCode == 200) {
        tag = response.body.Predictions[0].Tag;

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

        var ekispertRequestOptions = {
          url: encodeURI("https://api.ekispert.jp/v1/json/station?operationLineCode=" + lineCode + "&key=" + process.env.EKISPERT_ACCESS_KEY),
          json: true
        }

        // 駅すぱあとWebサービスへのGETリクエスト
        request.get(ekispertRequestOptions, function(error, response, body) {
          if (!error && response.statusCode == 200) {

            session.send("%s は、以下のえきをはしるよ。", lineName);

            stations = response.body.ResultSet.Point;
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
  } else {
    session.send("でんしゃのしゃしんを送ってね！");
  }
});
