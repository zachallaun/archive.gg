import { Router } from 'express';
const summoners = Router();

summoners.get('/:region/:summonerName', (req, res) => {
  res.json({
    summonerName: req.params.summonerName,
    division: 'FooBarDivision',
    region: req.params.region,
  });
});

export default summoners;
