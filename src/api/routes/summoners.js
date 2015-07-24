import _ from 'lodash';
import selectn from 'selectn';
import { Router } from 'express';
import registrationStates from 'constants/registrationStates';
import riotApi from 'utils/riotApi';
import crypto from 'crypto';
import { query } from 'db/pg';
import summoners from 'db/summoners';

function findSummoner({ region, summonerName }) {
  return new Promise((resolve, reject) => {
    query(
      summoners.select(summoners.star())
        .where(summoners.summonerName.equals(summonerName))
        .and(summoners.region.equals(region))
        .toQuery()
    ).then(
      rows => resolve(rows[0]),
      err => reject(err)
    );
  });
}

function insertSummoner(summoner) {
  return new Promise((resolve, reject) => {
    query(
      summoners.insert(summoner).toQuery()
    ).then(
      () => resolve(),
      err => reject(err)
    );
  });
}

function emailToken(summonerName) {
  const shasum = crypto.createHash('sha1');
  shasum.update(summonerName);
  return shasum.digest('hex');
}

function lookupSummoner(region, summonerName) {
  return new Promise((resolve, reject) => {
    findSummoner({ region, summonerName }).then(summoner => {
      if (summoner) {
        resolve(summoner);
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

          insertSummoner(summoner).then(
            () => resolve(summoner),
            err => reject(err)
          );
        }).catch(err => reject(err));
      }
    }).catch(err => reject(err));
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
