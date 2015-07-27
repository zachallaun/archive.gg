import { query } from 'db/pg';
import sql from 'sql';

const matches = sql.define({
  name: 'matches',
  columns: [
    'id',
    'matchId',
    'summonerId',
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
    'replayUnsubscribeUrl',
  ],
});

export function findMatches({ summonerId }) {
  return query(
    matches
      .select(matches.star())
      .where(matches.summonerId.equals(summonerId))
      .order(matches.matchCreation.descending)
      .toQuery()
  );
}

export function findMatch({ summonerId, matchId }) {
  return query(
    matches
      .select(matches.star())
      .where(matches.summonerId.equals(summonerId))
      .and(matches.matchId.equals(matchId))
      .toQuery()
  ).then(rows => rows[0]);
}

export function insertMatch(match) {
  return query(matches.insert(match).toQuery()).then(() => match);
}

export default matches;
