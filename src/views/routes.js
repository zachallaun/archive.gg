import React from 'react';
import { Route } from 'react-router';
import App from 'views/App';
import Home from 'views/Home';

export default (
  <Route component={ App }>
    <Route path="/" component={ Home } />
  </Route>
);
