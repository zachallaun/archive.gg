/* global __DEVELOPMENT__ */
import request from 'superagent';
import path from 'path';
import resourceVersions from 'constants/riot/resourceVersions';
import regions from 'constants/riot/regions';

const API_KEY = process.env.RIOT_GAMES_API_KEY;
if (!API_KEY) {
  throw 'process.env.RIOT_GAMES_API_KEY must be set';
}

function validateRegion(region) {
  if (!regions[region]) {
    throw `Unknown Riot region: ${region}`;
  }
}

function validateResource(resource) {
  if (!resourceVersions[resource]) {
    throw `Unknown Riot resource: ${resource}`;
  }
}

function baseUrl(region) {
  return `${region}.api.pvp.net/api/lol/`;
}

function apiUrl(region, resourcePath) {
  const base = `${baseUrl(region)}/${region}`;
  const [resource] = resourcePath.split('/');
  const resourceVersion = resourceVersions[resource];

  validateRegion(region);
  validateResource(resource);

  return 'https://' + path.join(base, resourceVersion, resourcePath);
}

function staticDataApiUrl(region, resourcePath) {
  const base = `${baseUrl(region)}/static-data/${region}`;
  const staticDataVersion = resourceVersions['lol-static-data'];

  validateRegion(region);

  return 'https://' + path.join(base, staticDataVersion, resourcePath);
}

function get(url, { extract, query = {} }) {
  if (__DEVELOPMENT__) {
    console.log(`Riot API GET: ${url}`);
  }

  return new Promise((resolve, reject) => {
    request
      .get(url)
      .query({api_key: API_KEY})
      .query(query)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(extract ? res.body[extract] : res.body);
        }
      });
  });
}

/* --- Champion API --- */

function champion(region, id, query) {
  const url = staticDataApiUrl(region, `champion/${id}`);
  return get(url, query);
}
champion.all = function (query) {
  const url = staticDataApiUrl(region, 'champion');
  return get(url, query);
}

/* --- League API --- */

const league = {
  bySummoner: function (region, id) {
    const url = apiUrl(region, `league/by-summoner/${id}/entry`);
    return get(url, { extract: id });
  }
};

/* --- Match API --- */

function match(region, id) {
  const url = apiUrl(region, `match/${id}`);
  return get(url);
}

/* --- Summoner API --- */

export function standardizedSummonerName(name) {
  return name.toLowerCase().replace(/ /g, '');
}

function summoner(region, id) {
  const url = apiUrl(region, `summoner/${id}`);
  return get(url, { extract: id });
}
summoner.byName = function (region, name) {
  const url = apiUrl(region, `summoner/by-name/${name}`);
  return get(url, { extract: standardizedSummonerName(name) });
}

/* --- Data Dragon (static assets) --- */

function imgUrl(group, imgName) {
  return `http://ddragon.leagueoflegends.com/cdn/${resourceVersions['cdn']}/img/${group}/${imgName}`;
}

/* --- Exports --- */

export default {
  champion: champion,
  league: league,
  match: match,
  summoner: summoner,

  imgUrl: imgUrl,
};
