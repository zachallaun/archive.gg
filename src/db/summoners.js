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

function caseInsensitiveEquals(attr, value) {
  return sql.functions.LOWER(attr).equals(value.toLowerCase());
}

// Accepts archiveEmailAddress OR region and summonerName
export function findSummoner({ id, region, summonerName, archiveEmailAddress }) {
  let q = summoners.select(summoners.star());

  if (id) {
    q = q.where(summoners.id).equals(id);
  }

  if (region) {
    q = q.where(caseInsensitiveEquals(summoners.region, region));
  }

  if (summonerName) {
    q = q.where(caseInsensitiveEquals(summoners.summonerName, summonerName));
  }

  if (archiveEmailAddress) {
    q = q.where(summoners.archiveEmailAddress.equals(archiveEmailAddress))
  }

  return query(q.toQuery()).then(rows => {
    if (rows[0]) {
      return {
        ...rows[0],
        id: parseInt(rows[0].id, 10),
      };
    }
  });
}

export function insertSummoner(summoner) {
  return query(summoners.insert(summoner).toQuery()).then(() => summoner);
}

export function updateSummoner(id, updates) {
  return query(summoners.update(updates).where(summoners.id.equals(id)).toQuery());
}

export default summoners;
