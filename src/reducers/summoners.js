import _ from 'lodash';
import selectn from 'selectn';
import ReactWithAddons from 'react/addons';
import { standardizedSummonerName } from 'utils/riotApi';
import regionNames from 'constants/riot/regions';
import {
  SUMMONER_LOAD,
  SUMMONER_LOAD_SUCCESS,
  SUMMONER_LOAD_FAIL,

  SUMMONER_UPDATE,
  SUMMONER_UPDATE_FAIL,
} from 'constants/actionTypes';

const { update } = ReactWithAddons.addons;

function getInitialState() {
  let state = {};

  Object.keys(regionNames).forEach(region => {
    state[region] = {};
  });

  return state;
}

const initialState = getInitialState();

export function getSummoner(state, region, summonerName) {
  return selectn(`${region.toUpperCase()}.${standardizedSummonerName(summonerName)}`, state);
}

export function isSummonerLoaded(state, region, summonerName) {
  return !!getSummoner(state, region, summonerName);
}

function undo(current, original, changes) {
  return _(current).omit(_.keys(changes)).merge(original).value();
}

function updateSummoner(state, summoner, spec) {
  return update(state, {
    [summoner.region.toUpperCase()]: {
      [standardizedSummonerName(summoner.summonerName)]: spec,
    },
  });
}

function insertSummoner(state, summoner) {
  return updateSummoner(state, summoner, { $set: summoner });
}

export default function summoners(state = initialState, action = {}) {
  switch (action.type) {
    case SUMMONER_LOAD:
      return insertSummoner(state, { ...action.summoner, loading: true });

    case SUMMONER_LOAD_SUCCESS:
      return insertSummoner(state, action.result);

    case SUMMONER_LOAD_FAIL:
      return insertSummoner(state, { ...action.summoner, failed: true });

    case SUMMONER_UPDATE:
      return updateSummoner(state, action.summoner, {
        $merge: action.updates,
      });

    case SUMMONER_UPDATE_FAIL:
      return updateSummoner(state, action.summoner, {
        $apply: (s) => undo(s, action.summoner, action.updates),
      });

    default:
      return state;
  }
}
