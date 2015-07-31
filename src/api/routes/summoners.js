import _ from 'lodash';
import selectn from 'selectn';
import { Router } from 'express';
import registrationStates from 'constants/registrationStates';
import riotApi from 'utils/riotApi';
import summoners, { findSummoner, insertSummoner, updateSummoner, genEmail, genToken } from 'db/summoners';
import matches, { findMatches } from 'db/matches';

/* --- DB/API Helpers --- */

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
    token: genToken(name),
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
  }).then(summoner => {
    if (summoner.registrationState === registrationStates.REGISTERED) {
      return fetchMatches(summoner);
    } else {
      return summoner;
    }
  });
}

const summonerWhitelist = [
  'id',
  'summonerName',
  'region',
  'registrationState',
  'token',
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
    matches: summoner.matches && summoner.matches.map((m) => {
      return _.pick(m, matchWhitelist)
    }),
  };
}

/* --- Routes --- */

function handleError(res, error) {
  console.log('ERROR:', error instanceof Error ? error.stack : error);
  res.status(500).end();
}

const routes = Router();

routes.get('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;

  fetchSummoner(region, summonerName).then(renderSummoner).then(::res.json).catch(error => {
    handleError(res, error);
  });
});

routes.patch('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  const whitelistUpdates = _.pick(req.body, [
    'registrationState',
  ]);

  updateSummoner({ region, summonerName }, whitelistUpdates)
    .then(renderSummoner)
    .then(::res.json)
    .catch(error => {
      handleError(res, error);
    });
});

routes.post('/:region/:id/deregister', (req, res) => {
  const { id, region } = req.params;

  findSummoner({ id, region })
    .then(verifyRunePage)
    .then(summoner => {
      if (summoner) {
        updateSummoner({ id }, { registrationState: registrationStates.NOT_REGISTERED })
          .then(() => res.json({ replayUnsubscribeUrl: summoner.replayUnsubscribeUrl }))
          .catch(error => handleError(res, error));
      } else {
        res.status(403).end();
      }
    })
    .catch(error => {
      handleError(res, error);
    });
});

export default routes;
