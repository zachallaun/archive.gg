/* global __DEVELOPMENT__ */
/* global __CLIENT__ */
import request from 'superagent';
import path from 'path';
import resourceVersions from 'constants/riot/resourceVersions';
import regions from 'constants/riot/regions';

const API_KEY = process.env.RIOT_GAMES_API_KEY;
if (!API_KEY && !__CLIENT__) {
  console.error('process.env.RIOT_GAMES_API_KEY must be set');
}

function validateRegion(region) {
  if (!regions[region.toUpperCase()]) {
    throw `Unknown Riot region: ${region}`;
  }
}

function validateResource(resource) {
  if (!resourceVersions[resource.toLowerCase()]) {
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
  const base = `global.api.pvp.net/api/lol/static-data/${region}`;
  const staticDataVersion = resourceVersions['lol-static-data'];

  validateRegion(region);

  return 'https://' + path.join(base, staticDataVersion, resourcePath);
}

function get(url, { extract, query = {} } = {}) {
  return new Promise((resolve, reject) => {
    request
      .get(url)
      .query({api_key: API_KEY})
      .query(query)
      .end((err, res) => {
        if (__DEVELOPMENT__) {
          console.info(`Riot API GET: (${res.status}) ${url} (query: ${JSON.stringify(query)})`);
        }

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
champion.all = function all(region, query) {
  const url = staticDataApiUrl(region, 'champion');
  return get(url, query);
};

/* --- League API --- */

const league = {
  bySummoner: function bySummoner(region, id) {
    const url = apiUrl(region, `league/by-summoner/${id}/entry`);
    return get(url, { extract: id });
  },
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
summoner.byName = function byName(region, name) {
  const url = apiUrl(region, `summoner/by-name/${name}`);
  return get(url, { extract: standardizedSummonerName(name) });
};
summoner.runes = function runes(region, id) {
  const url = apiUrl(region, `summoner/${id}/runes`);
  return get(url, { extract: id });
};

/* --- Data Dragon (static assets) --- */

function imgUrl(group, imgId) {
  return `http://ddragon.leagueoflegends.com/cdn/${resourceVersions.cdn}/img/${group}/${imgId}.png`;
}

/* --- Exports --- */

export default {
  champion: champion,
  league: league,
  match: match,
  summoner: summoner,

  imgUrl: imgUrl,
};
