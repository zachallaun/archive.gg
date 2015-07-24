import _ from 'lodash';
import { Router } from 'express';
import registrationStates from 'constants/registrationStates';

const summoners = Router();

const fakeSummoner = {
  summonerName: 'mutinyonthebay',
  region: 'NA',
  division: 'Silver I',
  registrationState: registrationStates.NOT_REGISTERED,
  archiveEmailAddress: 'replay+abcdefg12345@archive.gg',
};

summoners.get('/:region/:summonerName', (req, res) => {
  setTimeout(() => {
    res.json(fakeSummoner);
  }, 1000);
});

summoners.patch('/:region/:summonerName', (req, res) => {
  setTimeout(() => {
    _.assign(fakeSummoner, req.body);
    res.json(fakeSummoner);
  }, 1000);
})

export default summoners;
