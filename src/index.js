import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import AOS from 'aos';

import { Provider } from 'react-redux';

import store from './store';
import ReactModal from 'react-modal';
import { createInstance, MatomoProvider } from '@datapunt/matomo-tracker-react';

AOS.init({
  once: true,
});

const matomoHost = process.env.REACT_APP_MATOMO_HOST ?? 'poapxyz.matomo.cloud';
const matomoSiteId = parseInt(process.env.REACT_APP_MATOMO_SITE_ID);

const matomo = createInstance({
  siteId: matomoSiteId,
  urlBase: `https://${matomoHost}`,
  srcUrl: `https://cdn.matomo.cloud/${matomoHost}/matomo.js`,
  disabled: false,
  linkTracking: true,
  configurations: {
    disableCookies: true,
  },
});

ReactModal.setAppElement(document.getElementById('root'));

const render = () => {
  const App = require('./App').default;
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <MatomoProvider value={matomo}>
          <App />
        </MatomoProvider>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

render();

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', render);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
