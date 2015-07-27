import _ from 'lodash';
import { Router } from 'express';
import parseReplaygg from 'utils/parseReplaygg';
import riotApi from 'utils/riotApi';
import validMailgunOrigin from 'utils/validMailgunOrigin';
import summoners, { findSummoner } from 'db/summoners';
import matches, { findMatch, insertMatch } from 'db/matches';

/* --- DB/API Helpers --- */

function ensureMatchNotInDB(summoner, { matchId }) {
  const { id: summonerId } = summoner;

  return new Promise((resolve, reject) => {
    findMatch({ summonerId, matchId })
      .then(match => {
        if (!match) {
          resolve(summoner);
        } else {
          reject('Match data already stored');
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

function matchFields(summoner, apiData, matchInfo) {
  const {
    matchId,
    matchDuration,
    queueType,
    participants,
    participantIdentities
  } = apiData;

  const summonersByParticipantId = participantIdentities.reduce((o, p) => {
    o[p.participantId] = p.player;
    return o;
  }, {});

  const summonerInfo = _.find(participants, participant => {
    return summonersByParticipantId[participant.participantId].summonerId === summoner.id;
  });

  if (!summonerInfo) {
    throw `Summoner ${summoner.id} did not take part in match ${matchId}:\n${participants.map(p => p.participantId)}`;
  }

  const {
    championId,
    stats: {
      kills,
      deaths,
      assists,
      winner,
    }
  } = summonerInfo;

  const {
    matchHistoryUrl,
    replayUrl,
    replayUnsubscribeUrl,
  } = matchInfo;

  return {
    matchId,
    matchDuration,
    queueType,
    championId,
    kills,
    deaths,
    assists,
    winner,
    summonerId: summoner.id,
    matchHistoryUrl,
    replayUrl,
    replayUnsubscribeUrl,
  };
}

function fetchMatchFromApi(summoner, matchInfo) {
  const { region } = summoner;
  const { matchId } = matchInfo;

  return riotApi
    .match(region, matchId)
    .then(apiData => {
      return matchFields(summoner, apiData, matchInfo);
    });
}

/* --- Routes --- */

const routes = Router();

routes.post('/by-email', (req, res) => {
  if (!validMailgunOrigin(req.body)) {
    return res.status(403).end();
  }

  const matchInfo = parseReplaygg(req.body['body-html']);

  if (!matchInfo) {
    return res.status(406).end();
  }

  findSummoner({ archiveEmailAddress: req.body['recipient'] })
    .then(summoner => {
      if (summoner) {
        return ensureMatchNotInDB(summoner, matchInfo);
      } else {
        throw `No summoner with archiveEmailAddress '${req.body['recipient']}'`;
      }
    })
    .then(summoner => {
      return fetchMatchFromApi(summoner, matchInfo);
    })
    .then(insertMatch)
    .then(() => {
      res.status(200).end();
    })
    .catch(error => {
      if (error && error.status === 429) {
        res.status(429).end();
      } else {
        console.log('ERROR:', error);
        res.status(406).end();
      }
    });
});

export default routes;
