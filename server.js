/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json())

// This serves static files from the specified directory
app.use(express.static(__dirname));

const server = app.listen(process.env.PORT || 8080, () => {

  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

const endpoints = {}

app.post('/endpoints', (req, res) => {
  if (!endpoints[req.body.endpoint]) {
    endpoints[req.body.endpoint] = req.body
  }
  res.sendStatus(204)
})

app.delete('/endpoints', (req, res) => {
  Object.keys(endpoints).forEach(e => delete endpoints[e])
  res.sendStatus(204)
})

app.get('/endpoints', (req, res) => {
  res.status(200).send(Object.values(endpoints))
})

const webPush = require('web-push')
const keys = webPush.generateVAPIDKeys()
app.get('/vapid/publicKey', (req, res) => {
  res.status(200).send(keys.publicKey)
})

const options = {
  TTL: 60,
  vapidDetails: {
    subject: 'mailto:push-notif@wadouk.org',
    ...keys
  },
}

app.post('/notify', (req, res) => {
  Promise.all(req.body.endpoints.map(e => {
    return webPush.sendNotification(
      e,
      req.body.payload,
      options,
    )
  })).then(p => res.status(200).send(p), p => res.status(500).send(p))
})
