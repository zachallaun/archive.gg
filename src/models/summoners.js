import _ from 'lodash';
import riotApi from 'utils/riotApi';
import { findSummoner, insertSummoner, updateSummoner } from 'db/summoners';
import { findMatches } from 'db/matches';
import registrationStates from 'constants/registrationStates';
import moment from 'moment';

function verifyRunePage(summoner) {
  const { id, region, token } = summoner;

  return riotApi.summoner.runes(region, id).then(({ pages }) => {
    if (_.findWhere(pages, { name: token })) {
      return summoner;
    } else {
      return null;
    }
  });
}

function summonerFields(region, { id, name, profileIconId }) {
  return {
    id,
    region,
    summonerName: name,
    profileIconUrl: riotApi.imgUrl('profileicon', profileIconId),
    lastFetched: new Date().getTime(),
  };
}

function fetchSummonerFromApi(region, summonerName) {
  let summoner = {};

  return riotApi
    .summoner
    .byName(region, summonerName)
    .then(apiData => {
      _.assign(summoner, summonerFields(region, apiData));
      return riotApi.league.bySummoner(region, summoner.id);
    })
    .then(entries => {
      const rankedData = _.findWhere(entries, { queue: 'RANKED_SOLO_5x5' });
      if (rankedData) {
        summoner.division = `${_.capitalize(rankedData.tier.toLowerCase())} ${rankedData.entries[0].division}`;
      }
      return summoner;
    });
}

function fetchMatches(summoner) {
  return findMatches({ summonerId: summoner.id }).then(matches => {
    return {
      ...summoner,
      matches,
    };
  });
}

export function fetchSummoner(region, summonerName) {
  return findSummoner({ region, summonerName }).then(summoner => {
    if (summoner) {
      if (!summoner.lastFetched || moment().diff(moment(new Date(summoner.lastFetched)), 'hours') >= 1) {
        return fetchSummonerFromApi(region, summonerName).then(summoner => {
          return updateSummoner({ id: summoner.id }, _.omit(summoner, 'id'));
        });
      } else {
        return summoner;
      }
    } else {
      return fetchSummonerFromApi(region, summonerName).then(insertSummoner);
    }
  }).then(summoner => {
    if (summoner.registrationState === registrationStates.REGISTERED) {
      return fetchMatches(summoner);
    } else {
      return summoner;
    }
  });
}

export function deregisterSummoner({ id, region }) {
  return findSummoner({ id, region }).then(verifyRunePage).then(summoner => {
    if (summoner) {
      if (summoner.replayUnsubscribeUrl) {
        return updateSummoner({ id }, {
          registrationState: registrationStates.NOT_REGISTERED
        });
      } else {
        return summoner;
      }
    }
  });
}

export { updateSummoner } from 'db/summoners';
