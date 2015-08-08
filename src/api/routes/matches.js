import _ from 'lodash';
import { Router } from 'express';
import parseReplaygg from 'utils/parseReplaygg';
import riotApi from 'utils/riotApi';
import validMailgunOrigin from 'utils/validMailgunOrigin';
import summoners, { findSummoner, updateSummoner } from 'db/summoners';
import matches, { findMatch, insertMatch } from 'db/matches';
import registrationStates from 'constants/registrationStates';

// TODO: Move much of this into models/matches.js

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

function matchFields({ region, id: summonerId }, apiData, matchInfo) {
  const {
    matchId,
    matchDuration,
    matchCreation,
    queueType,
    participants,
    participantIdentities
  } = apiData;

  // TODO
  // Support queueTypes other than ranked. The problem is that
  // participantIdentity.player is only available for ranked games. For
  // normals/customs, we'll have to figure out which champ the summoner
  // played by looking at the subject of the replay.gg email or
  // something.
  if (!queueType.match(/ranked/i)) {
    throw `queueType ${queueType} currently unsupported`;
  }

  const summonersByParticipantId = participantIdentities.reduce((o, p) => {
    o[p.participantId] = p.player;
    return o;
  }, {});

  const summonerInfo = _.find(participants, participant => {
    const s = summonersByParticipantId[participant.participantId];
    return s.summonerId === summonerId;
  });

  if (!summonerInfo) {
    const summonerIds = _.values(summonersByParticipantId).map(p => {
      return p.summonerId;
    });
    throw `Summoner ${summonerId} did not take part in match ${matchId}. IDs: ${summonerIds}`;
  }

  const {
    championId,
    stats: {
      kills,
      deaths,
      assists,
      winner,
    },
  } = summonerInfo;

  const {
    matchHistoryUrl,
    replayUrl,
    replayUnsubscribeUrl,
  } = matchInfo;

  return riotApi
    .champion(region, championId)
    .then(({ key }) => {
      return {
        matchId,
        matchDuration,
        matchCreation,
        queueType,
        championId,
        championKey: key,
        kills,
        deaths,
        assists,
        winner,
        summonerId,
        matchHistoryUrl,
        replayUrl,
        replayUnsubscribeUrl,
      };
    })
}

function fetchMatchFromApi(summoner, matchInfo) {
  const { region } = summoner;
  const { matchId } = matchInfo;

  return riotApi
    .match(region, matchId)
    .then(matchApiData => {
      return matchFields(summoner, matchApiData, matchInfo);
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
        console.log(`Received match for "${summoner.summonerName}". Unsubscribe: ${match.replayUnsubscribeUrl}`);
        return ensureMatchNotInDB(summoner, matchInfo);
      } else {
        throw `No summoner with archiveEmailAddress '${req.body['recipient']}'`;
      }
    })
    .then(summoner => {
      return fetchMatchFromApi(summoner, matchInfo);
    })
    .then(insertMatch)
    .then(match => {
      return updateSummoner({id: match.summonerId}, {
        registrationState: registrationStates.REGISTERED,
        replayUnsubscribeUrl: match.replayUnsubscribeUrl,
      });
    })
    .then(() => {
      res.status(200).end();
    })
    .catch(error => {
      if (error && error.status === 429) {
        res.status(429).end();
      } else {
        console.log('ERROR:', error instanceof Error ? error.stack : error);
        res.status(406).end();
      }
    });
});

export default routes;
