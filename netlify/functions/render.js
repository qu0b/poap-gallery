'use strict'; 
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const axios = require('axios')
const morgan = require('morgan')

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
    'discordbot'
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

const getEvent = async (id) => {
  try {
    return await axios.get('https://api.poap.xyz/events/id/'+id)
  } catch (error) {
    console.error(error)
  }
}

const router = express.Router();
router.get('/', async (req, res) => {
  const isBot = dectectBot(req.headers['user-agent']);
  const eventId = req.baseUrl.split('/')[2];
  if (isBot) {
    const event = await getEvent(eventId)
    const { data } = event
    if (data) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`
      <!doctype html>
      <head>
            <title>POAP Gallery</title>
            <meta name="title" content="${data.name}">
            <meta name="description" content="${data.description}">
            <meta property="og:type" content="article">
            <meta property="og:site_name" content="POAP Gallery">
            <meta property="og:title" content="${data.name}">
            <meta property="og:description" content="${data.description}">
            <meta property="og:image" content="${data.image_url}">
            <meta property="og:image:height" content="200">
            <meta property="og:image:width" content="200">
            <meta property="twitter:card" content="summary">
            <meta property="twitter:site" content="@poapxyz">
            <meta property="twitter:title" content="${data.name}">
            <meta property="twitter:description" content="${data.description}">
            <meta property="twitter:image" content="${data.image_url}">
      </head>
      <body>
        <article>
          <div>
            <h1>${data.name}</h1>
          </div>
          <div>
            <p>${data.description}</p>
          </div>
        </article>
      </body>
      </html>`);
      res.end();
    } else {
      res.redirect('http://' + req.hostname)
    }
  } else {
    res.redirect('http://' + req.hostname + '/r/event/' + eventId)
  }
});
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))
app.use(['/.netlify/functions/render/*', '/.netlify/functions/render/','/.netlify/functions/render/event/*', '/event/*'], router);  // path must route to lambda

module.exports.handler = serverless(app);



