import selectn from 'selectn';
import ReactWithAddons from 'react/addons';

const { update } = ReactWithAddons.addons;

import regionNames from 'constants/regions';
import {
  SUMMONER_LOAD,
  SUMMONER_LOAD_SUCCESS,
} from 'constants/actionTypes';

function getInitialState() {
  let state = {};

  Object.keys(regionNames).forEach(region => {
    state[region] = {};
  });

  return state;
}

const initialState = getInitialState();

export function getSummoner(state, region, summonerName) {
  return selectn(`${region.toUpperCase()}.${summonerName.toLowerCase()}`, state);
}

export function isSummonerLoaded(state, region, summonerName) {
  return !!getSummoner(state, region, summonerName);
}

function insertSummoner(state, summoner) {
  return update(state, {
    [summoner.region.toUpperCase()]: {
      [summoner.summonerName.toLowerCase()]: {
        $set: summoner,
      },
    },
  });
}

export default function summoners(state = initialState, action = {}) {
  switch (action.type) {
    case SUMMONER_LOAD:
      return insertSummoner(state, { loading: true, ...action.summoner });

    case SUMMONER_LOAD_SUCCESS:
      return insertSummoner(state, action.result);

    default:
      return state;
  }
}
