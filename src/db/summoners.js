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

// Accepts archiveEmailAddress OR region and summonerName
export function findSummoner({ region, summonerName, archiveEmailAddress }) {
  let q = summoners.select(summoners.star());

  if (archiveEmailAddress) {
    q = q.where(
      summoners.archiveEmailAddress
      .equals(archiveEmailAddress)
    );
  } else {
    q = q.where(
      sql.functions.LOWER(summoners.summonerName)
      .equals(summonerName.toLowerCase())
    ).and(
      sql.functions.LOWER(summoners.region)
      .equals(region.toLowerCase())
    );
  }

  return query(q.toQuery()).then(rows => rows[0]);
}

export function insertSummoner(summoner) {
  return query(summoners.insert(summoner).toQuery()).then(() => summoner);
}

export default summoners;
