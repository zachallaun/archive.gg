import {
  SUMMONER_LOAD,
  SUMMONER_LOAD_SUCCESS,
  SUMMONER_LOAD_FAIL,
} from 'constants/actionTypes';

export function load(region, summonerName) {
  return {
    types: [SUMMONER_LOAD, SUMMONER_LOAD_SUCCESS, SUMMONER_LOAD_FAIL],
    promise: (client) => client.get(`/summoners/${region}/${summonerName}`),
  };
}
