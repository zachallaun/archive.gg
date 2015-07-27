import React, { Component, PropTypes } from 'react';
import riotApi from 'utils/riotApi';
import classSet from 'react-classset';
import moment from 'moment';

function formatMatchDuration(durationSecs) {
  const minutes = Math.floor(durationSecs / 60);
  const seconds = durationSecs % 60;

  return `${minutes} minutes, ${seconds} seconds`;
}

class Match extends Component {
  static propTypes = {
    match: PropTypes.shape({
      matchDuration: PropTypes.string.isRequired,
      matchCreation: PropTypes.string.isRequired,
      championKey: React.PropTypes.string.isRequired,
      queueType: PropTypes.string.isRequired,
      kills: PropTypes.number.isRequired,
      deaths: PropTypes.number.isRequired,
      assists: PropTypes.number.isRequired,
      winner: PropTypes.bool.isRequired,
      matchHistoryUrl: PropTypes.string.isRequired,
      replayUrl: PropTypes.string.isRequired,
    }),
  }

  render() {
    const {
      kills,
      deaths,
      assists,
      winner,
      matchDuration,
      matchCreation,
      championKey,
      replayUrl,
      matchHistoryUrl,
    } = this.props.match;

    const creation = moment(parseInt(matchCreation, 10));
    let creationFormat;

    if (moment().diff(creation, 'years') === 0) {
      creationFormat = 'ddd h:mma, MMM Do';
    } else {
      creationFormat = 'ddd h:mma, MMM Do \'YY';
    }

    const headerClassName = classSet({
      'ui header': true,
      'green': winner,
      'red': !winner,
    });

    return (
      <div className="item">
        <div className="ui tiny circular image">
          <img src={ riotApi.imgUrl('champion', championKey) } />
        </div>
        <div className="middle aligned content">
          <h3 className={ headerClassName }>
            { winner ? 'Victory' : 'Defeat' }
            &nbsp;&nbsp;&nbsp;
            <h5 className="ui grey header">{ creation.format(creationFormat) }</h5>
            <a className="ui right floated tiny button" href={ replayUrl } target="_blank">
              <i className="large file video outline icon"></i>
              Replay
            </a>
            <a className="ui right floated tiny button" href={ matchHistoryUrl } target="_blank">
              <i className="large info circle icon"></i>
              Match
            </a>
          </h3>
          <div className="meta">
            { kills }/{ deaths }/{ assists } { formatMatchDuration(matchDuration) }
          </div>
        </div>
      </div>
    );
  }
}

export default class MatchList extends Component {
  static propTypes = {
    summoner: PropTypes.shape({
      matches: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
      })),
    }),
  }

  render() {
    const { matches } = this.props.summoner;

    return (
      <div className="ui divided items">
        { matches.map(match => <Match match={ match } key={ match.id } />) }
      </div>
    );
  }
}
