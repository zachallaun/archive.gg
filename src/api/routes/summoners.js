import _ from 'lodash';
import selectn from 'selectn';
import { Router } from 'express';
import registrationStates from 'constants/registrationStates';
import riotApi from 'utils/riotApi';
import crypto from 'crypto';

const summoners = Router();

let summonerStore = {};

function getSummoner({ region, summonerName }) {
  return selectn(`${region.toUpperCase()}.${summonerName.toLowerCase()}`, summonerStore);
}

function setSummoner(summoner) {
  const region = summoner.region.toUpperCase();
  const summonerName = summoner.summonerName.toLowerCase();

  if (!summonerStore[region]) {
    summonerStore[region] = {};
  }

  summonerStore[region][summonerName] = summoner;
}

function emailToken(summonerName) {
  const shasum = crypto.createHash('sha1');
  shasum.update(summonerName);
  return shasum.digest('hex');
}

function lookupSummoner(region, summonerName) {
  return new Promise((resolve, reject) => {
    const cached = getSummoner({ region, summonerName });
    if (cached) {
      resolve(cached);
    } else {
      let summoner = {};
      riotApi.summoner.byName(region, summonerName).then(data => {
        _.assign(summoner, {
          registrationState: registrationStates.NOT_REGISTERED,
          archiveEmailAddress: `replay+${emailToken(summonerName)}@archive.gg`,
          region: region,
          summonerId: data.id,
          summonerName: data.name,
          profileIconUrl: riotApi.imgUrl('profileicon', `${data.profileIconId}.png`),
        });
        return riotApi.league.bySummoner(region, summoner.summonerId);
      }).then(entries => {
        const rankedData = _.findWhere(entries, { queue: 'RANKED_SOLO_5x5' });
        if (rankedData) {
          _.assign(summoner, {
            division: `${_.capitalize(rankedData.tier.toLowerCase())} ${rankedData.entries[0].division}`,
          });
        }

        setSummoner(summoner);

        resolve(summoner);
      }).catch(error => {
        reject(error);
      });
    }
  });
}

summoners.get('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  lookupSummoner(region, summonerName).then(summoner => {
    res.json(summoner);
  }).catch(error => {
    console.log('ERROR:', error);
    res.status(500).json(error);
  });
});

summoners.patch('/:region/:summonerName', (req, res) => {
  const { region, summonerName } = req.params;
  const summoner = getSummoner({ region, summonerName });
  _.assign(summoner, req.body);
  res.json(summoner);
});

export default summoners;
