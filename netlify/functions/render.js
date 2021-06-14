'use strict'; 
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

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

const router = express.Router();
router.get('/', (req, res) => {
  const isBot = dectectBot(req.headers['user-agent']);
  console.log('i am here')
  if (isBot) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
    <!doctype html>
    <head>
          <title>hola</title>
          <meta property="og:type" content="article">
          <meta property="og:site_name" content="Quipu Market">
          <meta property="og:title" content="$hola">
          <meta property="og:description" content="hola">
          <meta property="og:image:height" content="200">
          <meta property="og:image:width" content="300">
    </head>
    <body>
      <article>
        <div>
          <h2>hola</h2>
        </div>
        <div>
          <p>hola</p>
        </div>
      </article>
    </body>
    </html>`);
    res.end();
  } else {
    res.redirect('http://'+req.hostname+'/r'+req.originalUrl)
  }
});

app.use('/.netlify/functions/render', router);  // path must route to lambda

module.exports.handler = serverless(app);



