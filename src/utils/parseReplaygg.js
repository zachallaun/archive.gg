import _ from 'lodash';

function extractHrefs(htmlBody) {
  const matchHref = /href="([^\"]*)"/g;
  let results = [];
  let match;

  while (match = matchHref.exec(htmlBody)) {
    results.push(match[1]);
  }

  return results;
}

function toMatchInfo(hrefs) {
  const matchHistoryUrl = _.find(hrefs, href => {
    return href.search(/matchhistory/i) !== -1;
  });

  const replayUrl = _.find(hrefs, href => {
    return href.search(/replay.gg\/\?r=/i) !== -1;
  });

  const replayUnsubscribeUrl = _.find(hrefs, href => {
    return href.search(/replay.gg\/\?remove=/i) !== -1;
  });

  if (matchHistoryUrl && replayUrl && replayUnsubscribeUrl) {
    const matchId = parseInt(matchHistoryUrl.match(/\/(\d+)\//)[1], 10);

    return {
      matchId,
      matchHistoryUrl,
      replayUrl,
      replayUnsubscribeUrl: replayUnsubscribeUrl.replace('&amp;', '&'),
    };
  }
}

export default function parseReplaygg(emailBody) {
  const matchInfo = toMatchInfo(extractHrefs(emailBody));

  if (!matchInfo) {
    console.error(`ERROR, Could not parse email:\n${emailBody}`);
  }

  return matchInfo;
}
