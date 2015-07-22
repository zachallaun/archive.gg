import React from 'react';
import { Route } from 'react-router';
import App from 'views/App';
import SummonerNav from 'views/SummonerNav';
import Summoner from 'views/Summoner';

export default (
  <Route component={ App }>
    <Route path="/" component={ SummonerNav } />
    <Route path="/:region/:summonerName" component={ Summoner } />
  </Route>
);
