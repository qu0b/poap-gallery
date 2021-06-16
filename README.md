# POAP gallary

* https://www.reddit.com/r/ethdev/comments/icfzhn/poap_proof_of_attendance_protocol_is_interested/g22d6ly/
* https://etherscan.io/token/0x22c1f6050e56d2876009903609a2cc3fef83b415
* https://opensea.io/assets/poap-v2?sortBy=assets_prod_main
* https://etherscan.io/token/0x22c1f6050e56d2876009903609a2cc3fef83b415?a=0xf6b6f07862a02c85628b3a9688beae07fea9c863#inventory

* https://api.poap.xyz/token/16815/image

## Mainnet

deploy contact: 0x22C1f6050E56d2876009903609a2cC3fEf83B415
* https://etherscan.io/token/0x22c1f6050e56d2876009903609a2cc3fef83b415

## Ropsen Testnet

deploy contract: 0x50C5CA3e7f5566dA3Aa64eC687D283fdBEC2A2F2


## How to setup

```
git clone https://github.com/poap-xyz/poap-gallery.git
cd
yarn
cp .env.template .env // Add your own REACT_APP_RPC_PROVIDER_URL
```

## How to run with functions localy
### Link to configuration of Netlify
* https://docs.netlify.com/cli/get-started/#get-started-with-netlify-dev


### Files to change before to start running locally 
#### netlify.toml
From this
```
[[redirects]]
  from = "/event/*"
  to = "https://gallery-prerender.netlify.app/.netlify/functions/render/:route"
  status = 200
  force = true
```
To this
```
[[redirects]]
  from = "/event/*"
  to = "/.netlify/functions/render/:route"
  status = 200
  force = true
```

#### render.js
From this
```
const eventId = req.baseUrl.split('/')[2];
```
To this
```
const eventId = req.baseUrl.split('/')[4]
```
### Commands to run
```
npm install netlify-cli -g
netlify init
netlify dev
```