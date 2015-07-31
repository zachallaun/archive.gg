import _ from 'lodash';
import selectn from 'selectn';
import { Router } from 'express';
import registrationStates from 'constants/registrationStates';
import riotApi from 'utils/riotApi';
import summoners, { findSummoner, insertSummoner, updateSummoner, genEmail } from 'db/summoners';
import matches, { findMatches } from 'db/matches';

/* --- DB/API Helpers --- */

function summonerFields(region, { id, name, profileIconId }) {
  return {
    id,
    region,
    summonerName: name,
    archiveEmailAddress: genEmail(name),
    profileIconUrl: riotApi.imgUrl('profileicon', profileIconId),
    registrationState: registrationStates.NOT_REGISTERED,
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

function fetchSummoner(region, summonerName) {
  return findSummoner({ region, summonerName }).then(summoner => {
    if (summoner) {
      return summoner;
    } else {
      return fetchSummonerFromApi(region, summonerName).then(insertSummoner);
    }
  }).then(fetchMatches);
}

const summonerWhitelist = [
  'id',
  'summonerName',
  'region',
  'registrationState',
  'archiveEmailAddress',
  'profileIconUrl',
  'division',
];

const matchWhitelist = [
  'id',
  'championId',
  'championKey',
  'matchDuration',
  'matchCreation',
  'queueType',
  'kills',
  'deaths',
  'assists',
  'winner',
  'matchHistoryUrl',
  'replayUrl',
];

function renderSummoner(summoner) {
  return {
    ..._.pick(summoner, summonerWhitelist),
    matches: summoner.matches.map((m) => {
      return _.pick(m, matchWhitelist)
    }),
  };
}

/* --- Routes --- */

const routes = Router();

routes.get('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  fetchSummoner(region, summonerName).then(renderSummoner).then(::res.json).catch(error => {
    console.log('ERROR:', error instanceof Error ? error.stack : error);
    res.status(500).json(error);
  });
});

routes.patch('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  const whitelistUpdates = _.pick(req.body, [
    'registrationState',
  ]);

  updateSummoner({ region, summonerName }, whitelistUpdates).then(renderSummoner).then(::res.json).catch(error => {
    console.log('ERROR:', error instanceof Error ? error.stack : error);
    res.status(500).json(error);
  });
});

export default routes;
