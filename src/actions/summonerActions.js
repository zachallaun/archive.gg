import {
  SUMMONER_LOAD,
  SUMMONER_LOAD_SUCCESS,
  SUMMONER_LOAD_FAIL,

  SUMMONER_UPDATE,
  SUMMONER_UPDATE_SUCCESS,
  SUMMONER_UPDATE_FAIL,
} from 'constants/actionTypes';

function loadSummoner(region, summonerName) {
  return {
    summoner: { region, summonerName },
    types: [SUMMONER_LOAD, SUMMONER_LOAD_SUCCESS, SUMMONER_LOAD_FAIL],
    promise: (client) => client.get(`/summoners/${region}/${summonerName}`),
  };
}

function updateSummoner(summoner, updates) {
  const { region, summonerName } = summoner;

  return {
    summoner: summoner,
    updates: updates,
    types: [SUMMONER_UPDATE, SUMMONER_UPDATE_SUCCESS, SUMMONER_UPDATE_FAIL],
    promise: (client) => client.patch(`/summoners/${region}/${summonerName}`, {
      data: updates,
    }),
  };
}

export default {
  loadSummoner,
  updateSummoner,
};
