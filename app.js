'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const request = require('request');
const url = require('url');

const getRepByZip = require('./my_modules/get_repByZip');

const VALIDATION_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_TOKEN = process.env.PAGE_TOKEN;
const APP_SECRET = process.env.APP_SECRET;

const app = express();
app.use(bodyParser.json({
  verify: verifyRequestSignature
}));

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.error('Couldn\'t validate the signature.');
    throw new Error('No request signature.');
  } else {
    let elements = signature.split('=');
    let method = elements[0];
    let signatureHash = elements[1];

    let expectedHash = crypto.createHmac('sha1', APP_SECRET)
      .update(buf)
      .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error('Couldn\'t validate the request signature.');
    }
  }
}

// REGULAR EXPRESS SECTION
app.get('/', function getIndex(req, res) {
  res.send('Hello world');
});
// Validate webhook with Facebook
app.get('/webhook', function getWebhook(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});
// Handle messages to and from Messenger bot
app.post('/webhook', function postWebhook(req, res) {
  let data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      let pageID = entry.id;
      let timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });

    res.sendStatus(200);
  }
});
// ACT ON MESSAGE RECEIVED FROM USER
function receivedMessage(event) {
  // Retrieve Facebook user ID of sender
  const sender = event.sender.id;
  const timeOfMessage = event.timestamp;

  // Retrieve message content
  const {
    text,
    attachments
  } = event.message;

  if (text) {
    // Check content of text message
    switch (text) {
      default:
        const text_to_num =  parseInt(text, 10);
        if (!isNaN(text_to_num)) {
          getRepByZip(text).then((res)=>{
            if (res.length > 1) {
              sendTextMessage(sender, `You have ${res.length} possible representatives.`);
              res.forEach((rep)=>{
                sendRepInfo(sender, rep);
              });
            } else {
              sendRepInfo(sender, res[0]);
            }
          }).catch((err) => {
            sendTextMessage(sender, err);
          });
        } else {
          sendTextMessage(sender, 'Type in your zip code, and I\'ll look up your representatives\' info.');
        }
    }
  } else if (attachments) {
    sendTextMessage(sender, 'I can\'t handle attachments yet.');
  }
}
// SEND BASIC TEXT MESSAGE
function sendTextMessage(recipientId, messageText) {
  // Add recipient and message text to message object
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  // Pass message object to send function
  callSendAPI(messageData);
}
function sendRepInfo(recipientId, repObj) {
  // Add recipient and message text to message object
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `Rep. ${repObj.firstName} ${repObj.lastName} (${repObj.party})`,
          buttons: [
            {
              type: 'web_url',
              url: repObj.website,
              title: url.parse(repObj.website).hostname
            },
            {
              type: 'phone_number',
              title: `Call ${repObj.phone}`,
              payload: `+1${repObj.phone.replace(/\-/g, '')}`
            }
          ]
        }
      }
    }
  };

  // Pass message object to send function
  callSendAPI(messageData);
}
//SEND MESSAGE BACK TO USER
function callSendAPI(messageData) {
  // Make post request to Facebook Send API
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_TOKEN
    },
    method: 'POST',
    json: messageData

  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      let recipientId = body.recipient_id;
      let messageId = body.message_id;
    } else {
      console.error('Unable to send message.');
      console.error(response);
      console.error(error);
    }
  });
}

app.listen(process.env.PORT || 5000);
