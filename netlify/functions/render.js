'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const morgan = require('morgan');
const axios = require('axios');

const POAP_API_URL = process.env.REACT_APP_POAP_API_URL;
const POAP_API_API_KEY = process.env.REACT_APP_POAP_API_API_KEY;

function dectectBot(userAgent) {
  const bots = [
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'slackbot',
    'vkShare',
    'facebot',
    'outbrain',
    'W3C_Validator',
    'whatsapp',
    'telegrambot',
    'discordbot',
  ];
  const agent = userAgent.toLowerCase();
  console.log(agent, 'agent');
  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found');
  return false;
}
function buildPOAPApiHeaders() {
  return { 'X-API-Key': POAP_API_API_KEY };
}

async function fetchPOAPApi(path) {
  const url = `${POAP_API_URL}${path}`;
  const headers = buildPOAPApiHeaders();

  const res = await axios.get(url, { headers });
  return res.data;
}

async function getEvent(id) {
  return await fetchPOAPApi(`/events/id/${id}`);
}

async function getEventTokens(id, limit, offset) {
  return await fetchPOAPApi(
    `/event/${id}/poaps?limit=${limit}&offset=${offset}`
  );
}

const router = express.Router();
router.get('/', async (req, res) => {
  const isBot = dectectBot(req?.headers['user-agent']);
  const eventId = req?.baseUrl?.split('/')[2];

  if (isBot) {
    const event = await getEvent(eventId);
    const eventTokens = await getEventTokens(eventId, 1, 0);

    let tokenCount = eventTokens?.total;
    let description = event?.description;

    if (tokenCount > 0) {
      description = '[ Supply: ' + tokenCount + ' ] ' + description;
    }

    if (event) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`
      <!doctype html>
      <head>
            <title>POAP Gallery</title>
            <meta name="title" content="${event.name}">
            <meta name="description" content="${description}">
            <meta property="og:type" content="article">
            <meta property="og:site_name" content="POAP Gallery">
            <meta property="og:title" content="${event.name}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${event.image_url}">
            <meta property="og:image:height" content="200">
            <meta property="og:image:width" content="200">
            <meta property="twitter:card" content="summary">
            <meta property="twitter:site" content="@poapxyz">
            <meta property="twitter:title" content="${event.name}">
            <meta property="twitter:description" content="${description}">
            <meta property="twitter:image" content="${event.image_url}">
      </head>
      <body>
        <article>
          <div>
            <h1>${event.name}</h1>
          </div>
          <div>
            <p>${description}</p>
          </div>
        </article>
      </body>
      </html>`);
      res.end();
    } else {
      res.redirect('http://' + req.hostname);
    }
  } else {
    res.redirect('http://' + req.hostname + '/r/event/' + eventId);
  }
});
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
  })
);
app.use(
  [
    '/.netlify/functions/render/*',
    '/.netlify/functions/render/',
    '/.netlify/functions/render/event/*',
    '/event/*',
    '/render/*',
  ],
  router
); // path must route to lambda

module.exports.handler = serverless(app);
