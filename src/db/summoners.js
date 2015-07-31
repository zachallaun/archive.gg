import _ from 'lodash';
import { query } from 'db/pg';
import sql from 'sql';
import crypto from 'crypto';

const summoners = sql.define({
  name: 'summoners',
  columns: [
    'id',
    'summonerId',
    'summonerName',
    'registrationState',
    'token',
    'archiveEmailAddress',
    'region',
    'profileIconUrl',
    'replayUnsubscribeUrl',
    'division',
  ],
});

function caseInsensitiveEquals(attr, value) {
  return sql.functions.LOWER(attr).equals(value.toLowerCase());
}

export function genToken(id) {
  return `archivegg-${id}`;
}

function genEmailToken(summonerName) {
  const shasum = crypto.createHash('sha1');
  shasum.update(summonerName);
  return shasum.digest('hex').slice(0, 25);
}

export function genEmail(summonerName) {
  return `replay+${genEmailToken(summonerName)}@mail.archive.gg`;
}

// Accepts archiveEmailAddress OR region and summonerName
export function findSummoner({ id, region, summonerName, archiveEmailAddress }) {
  let q = summoners.select(summoners.star());

  if (id) {
    q = q.where(summoners.id.equals(id));
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
  const [keys, values] = [_.keys(summoner), _.values(summoner)]

  const q = `
    INSERT INTO summoners (${ keys.map(k => `"${k}"`).join(', ') })
      SELECT ${ values.map((v, i) => `$${i + 1}`).join(', ') }
      WHERE NOT EXISTS (
        SELECT 1 FROM summoners WHERE summoners.id = $${values.length + 1}
      )
  `

  return query({text: q, values: values.concat(summoner.id)}).then(() => summoner);
}

export function updateSummoner(whereClauses, updates) {
  const initialQuery = summoners.update(updates);

  let q = _.reduce(whereClauses, (q, val, attr) => {
    return q.where(summoners[attr].equals(val))
  }, initialQuery);

  return query(q.toQuery());
}

export default summoners;
