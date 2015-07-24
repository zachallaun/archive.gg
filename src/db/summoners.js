import { query } from 'db/pg';
import sql from 'sql';
import { standardizedSummonerName } from 'utils/riotApi';

const summoners = sql.define({
  name: 'summoners',
  columns: [
    'id',
    'summonerId',
    'summonerName',
    'registrationState',
    'archiveEmailAddress',
    'region',
    'profileIconUrl',
    'division',
  ],
});

export function findSummoner({ region, summonerName }) {
  return query(
    summoners
      .select(summoners.star())
      .where(sql.functions.LOWER(summoners.summonerName).equals(summonerName.toLowerCase()))
      .and(sql.functions.LOWER(summoners.region).equals(region.toLowerCase()))
      .toQuery()
  ).then(rows => rows[0]);
}

export function insertSummoner(summoner) {
  return query(summoners.insert(summoner).toQuery()).then(() => summoner);
}

export default summoners;
