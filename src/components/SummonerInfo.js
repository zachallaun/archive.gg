import React, { Component, PropTypes } from 'react';
import classSet from 'react-classset';
import {
  REGISTERED,
  NOT_REGISTERED,
  REGISTRATION_PENDING,
} from 'constants/registrationStates';

class Registered extends Component {
  render() {
    return <h1>registered</h1>;
  }
}

class Pending extends Component {
  render() {
    return (
      <p>Pending</p>
    );
  }
}

class Register extends Component {
  render() {
    return (
      <div className="content">
        <p>
          Archive.gg works in tandem with <a href="http://replay.gg" target="_blank">Replay.gg</a>. To track recorded games, you need to sign up for Replay.gg using the email address provided below. Once that's done, you'll be able to see a list of recorded games with links to the match history and Replay.gg recording.
        </p>
        <p>
          <a href="http://replay.gg" target="_blank">Sign up on replay.gg</a> using the email address below.
        </p>
        <input readOnly type="text" className="ui fluid input" value="foo@archive.gg" />
      </div>
    );
  }
}

class Registration extends Component {
  render() {
    const { registrationState } = this.props.summoner;

    const registerStepClassName = classSet({
      'step': true,
      'active': registrationState === NOT_REGISTERED,
    });

    const pendingStepClassName = classSet({
      'step': true,
      'active': registrationState === REGISTRATION_PENDING,
      'disabled': registrationState !== REGISTRATION_PENDING,
    });

    const ContentComponent = {
      [NOT_REGISTERED]: Register,
      [REGISTRATION_PENDING]: Pending,
    }[registrationState];

    return (
      <div>
        <div className="ui fluid small steps">
          <div className={ registerStepClassName }>
            <i className="mail outline icon"></i>
            <div className="content">
              <div className="title">Register</div>
              <div className="description">Sign up on replay.gg</div>
            </div>
          </div>

          <div className={ pendingStepClassName }>
            <i className="game icon"></i>
            <div className="content">
              <div className="title">Play</div>
              <div className="description">Play a game and wait for replay.gg to record it</div>
            </div>
          </div>
        </div>

        <div className="ui hidden divider"></div>

        <ContentComponent { ...this.props } />
      </div>
    );
  }
}

export default class SummonerInfo extends Component {
  static propTypes = {
    summoner: PropTypes.shape({
      summonerName: PropTypes.string.isRequired,
      division: PropTypes.string.isRequired,
      region: PropTypes.string.isRequired,
      registrationState: PropTypes.string.isRequired,
    }).isRequired,
  }

  renderSummonerSummary() {
    const { summonerName, region, division } = this.props.summoner;

    return (
      <div className="ui two column centered grid">
        <div className="column">
          <div className="ui items">
            <div className="item">
              <div className="ui image">
                <i className="huge user icon"></i>
              </div>
              <div className="middle aligned content">
                <span className="header">{ summonerName }</span>
                <div className="meta">
                  <span>{ region }</span> / <span>{ division }</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const RegistrationStateComponent = {
      [REGISTERED]: Registered,
      [NOT_REGISTERED]: Registration,
      [REGISTRATION_PENDING]: Registration,
    }[this.props.summoner.registrationState];

    return (
      <div className="ui two column centered grid">
        <div className="column">
          { this.renderSummonerSummary() }
          <div className="ui hidden divider"></div>
          <RegistrationStateComponent { ...this.props } />
        </div>
      </div>
    );
  }
}
