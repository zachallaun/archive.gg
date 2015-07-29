/* global __DEVTOOLS__ */
import React from 'react';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import Location from 'react-router/lib/Location';
import createStore from 'redux/create';
import ApiClient from 'ApiClient';
import universalRouter from 'utils/universalRouter';
const history = new BrowserHistory();
const client = new ApiClient();

const dest = document.getElementById('content');
const store = createStore(client, window.__data);
const location = new Location(document.location.pathname, document.location.search);

let useDevTools = __DEVTOOLS__;
universalRouter(location, history, store)
  .then((component) => {
    if (useDevTools) {
      const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');
      // const LogMonitor = require('./dev/LogMonitor');
      console.info('You will see a "Warning: React attempted to reuse markup in a container but the checksum was invalid." message. That\'s because the redux-devtools are enabled.');
      React.render(
        <div style={{ height: '100%' }}>
          { component }
          <DebugPanel top right bottom key="debugPanel">
            <DevTools store={ store } monitor={ LogMonitor } />
          </DebugPanel>
        </div>,
        dest
      );
    } else {
      React.render(component, dest);
    }
  }, (error) => {
    console.error(error);
  });

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger
  const reactRoot = window.document.getElementById('content');

  if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes || !reactRoot.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}
