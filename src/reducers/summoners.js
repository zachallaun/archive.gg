import selectn from 'selectn';
import regionNames from '../constants/regions';

function getInitialState() {
  /* let state = {};

     Object.keys(regionNames).forEach(region => {
     state[region] = {};
     }); */

  const state = {
    [regionNames.NA.toLowerCase()]: {
      mutinyonthebay: {
        summonerName: 'mutinyonthebay',
        division: 'Silver III',
      },
    },
  };

  return state;
}

const initialState = getInitialState();

export default function summoners(state = initialState, action = {}) {
  return state;
}

export function getSummoner(state, region, summonerName) {
  return selectn(`${region.toLowerCase()}.${summonerName.toLowerCase()}`, state);
}

export function isSummonerLoaded(state, region, summonerName) {
  return !!getSummoner(state, region, summonerName);
}
