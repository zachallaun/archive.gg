import { Router } from 'express';
import registrationStates from 'constants/registrationStates';

const summoners = Router();

const fakeSummoner = {
  summonerName: 'mutinyonthebay',
  region: 'NA',
  division: 'Silver I',
  registrationState: registrationStates.NOT_REGISTERED,
};

summoners.get('/:region/:summonerName', (req, res) => {
  setTimeout(() => {
    res.json(fakeSummoner);
  }, 1000);
});

export default summoners;
