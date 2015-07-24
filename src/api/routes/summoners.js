import _ from 'lodash';
import selectn from 'selectn';
import { Router } from 'express';
import registrationStates from 'constants/registrationStates';
import riotApi from 'utils/riotApi';
import crypto from 'crypto';
import summoners, { findSummoner, insertSummoner } from 'db/summoners';

function emailToken(summonerName) {
  const shasum = crypto.createHash('sha1');
  shasum.update(summonerName);
  return shasum.digest('hex');
}

function summonerFields(region, { id, name, profileIconId }) {
  return {
    region,
    summonerName: name,
    summonerId: id,
    archiveEmailAddress: `replay+${emailToken(name)}@archive.gg`,
    profileIconUrl: riotApi.imgUrl('profileicon', `${profileIconId}.png`),
    registrationState: registrationStates.NOT_REGISTERED,
  };
}

function fetchSummonerFromApi(region, summonerName) {
  let summoner = {};

  return riotApi
    .summoner
    .byName(region, summonerName)
    .then(data => {
      _.assign(summoner, summonerFields(region, data));
      return riotApi.league.bySummoner(region, summoner.summonerId);
    })
    .then(entries => {
      const rankedData = _.findWhere(entries, { queue: 'RANKED_SOLO_5x5' });
      if (rankedData) {
        summoner.division = `${_.capitalize(rankedData.tier.toLowerCase())} ${rankedData.entries[0].division}`;
      }
      return summoner;
    });
}

function lookupSummoner(region, summonerName) {
  return findSummoner({ region, summonerName }).then(summoner => {
    if (summoner) {
      return summoner;
    } else {
      return fetchSummonerFromApi(region, summonerName).then(insertSummoner);
    }
  });
}

const routes = Router();

routes.get('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  lookupSummoner(region, summonerName).then(summoner => {
    res.json(summoner);
  }).catch(error => {
    console.log('ERROR:', error);
    res.status(500).json(error);
  });
});

routes.patch('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  const summoner = getSummoner({ region, summonerName });
  _.assign(summoner, req.body);
  res.json(summoner);
});

export default routes;
