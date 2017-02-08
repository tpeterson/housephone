'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const request = require('request');

const VALIDATION_TOKEN = process.env.VERIFY_TOKEN || process.env.MESSENGER_HOUSEPHONE_VERIFY;
const PAGE_TOKEN = process.env.PAGE_TOKEN || process.env.MESSENGER_HOUSEPHONE_PAGE;
const APP_SECRET = process.env.APP_SECRET || process.env.MESSENGER_HOUSEPHONE_SECRET;

const app = express();
app.use(bodyParser.json({
  verify: verifyRequestSignature
}));

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error('Couldn\'t validate the signature.');
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
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

app.listen(process.env.PORT || 5000);
