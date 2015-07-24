import { query } from 'db/pg';
import sql from 'sql';

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

export default summoners;
