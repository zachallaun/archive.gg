import _ from 'lodash';
import { Router } from 'express';
import { fetchSummoner, updateSummoner, deregisterSummoner } from 'models/summoners';

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

  deregisterSummoner({ id, region }).then(summoner => {
    if (summoner) {
      res.json({ replayUnsubscribeUrl: summoner.replayUnsubscribeUrl });
    } else {
      res.status(403).end();
    }
  }).catch(error => handleError(res, error));
});

export default routes;
