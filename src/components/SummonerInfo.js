import React, { Component, PropTypes } from 'react';
import MatchList from 'components/MatchList';
import Deregister from 'components/Deregister';
import CopyableField from 'components/CopyableField';
import { REPLAY_GG_URL } from 'constants/misc';
import {
  NOT_REGISTERED,
  REGISTRATION_PENDING,
  REGISTERED,
} from 'constants/registrationStates';

class Register extends Component {
  static propTypes = {
    summoner: PropTypes.object.isRequired,
    onRegisterAttempt: PropTypes.func.isRequired,
  }

  constructor({ summoner }) {
    super();
    this.state = {
      showWaiting: summoner.registrationState === REGISTRATION_PENDING,
    };
  }

  componentWillReceiveProps(nextProps) {
    const currentState = this.props.summoner.registrationState;
    const nextState = nextProps.summoner.registrationState;

    if (currentState === NOT_REGISTERED && nextState === REGISTRATION_PENDING) {
      this.setState({ showWaiting: true });
    }
  }

  render() {
    const { archiveEmailAddress } = this.props.summoner;

    return (
      <div className="content">
        <h5>How it works</h5>

        <p>
          Archive.gg works in tandem with <a href={ REPLAY_GG_URL } target="_blank">Replay.gg</a>. To track recorded games, you need to sign up for Replay.gg using the email address provided below. Once that's done, we'll begin collecting information from replay.gg after a match. You can then check back here to see a list of your recorded games.
        </p>

        <h5>Get started</h5>

        <div className="ui segment">
          <div className="ui mini grey ribbon label">Step 1</div>
          <hr style={{ visibility: 'hidden' }} />
          <CopyableField value={ archiveEmailAddress } />

          <div className="ui divider"></div>

          <div className="ui mini grey ribbon label">Step 2</div>
          <hr style={{ visibility: 'hidden' }} />
          <a className="ui teal submit button" href={ REPLAY_GG_URL } target="_blank">
            Sign up on replay.gg
          </a>

          <div className="ui divider"></div>

          <div className="ui mini grey ribbon label">Step 3</div>
          <hr style={{ visibility: 'hidden' }} />
          {
            this.state.showWaiting ?
            <div>
              <div className="ui disabled teal button">
                <i className="ui active small inline indeterminate inverted loader"></i>
                <span style={{ marginLeft: '1em' }}>Waiting on games from replay.gg – go play some LoL!</span>
              </div>
              <div className="ui small pointing label">
                If it's been a while, you may not have registered correctly.
              </div>
            </div> :
            <button className="ui teal submit button" onClick={ this.props.onRegisterAttempt }>
              Click here after signup
            </button>
          }
        </div>
      </div>
    );
  }
}

class Registration extends Component {
  static propTypes = {
    summoner: PropTypes.object.isRequired,
    updateSummoner: PropTypes.func.isRequired,
  }

  attemptRegister() {
    this.props.updateSummoner(this.props.summoner, {
      registrationState: REGISTRATION_PENDING,
    });
  }

  render() {
    return (
      <div>
        <div className="ui hidden divider"></div>
        <Register
          summoner={ this.props.summoner }
          onRegisterAttempt={ ::this.attemptRegister }
        />
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
      archiveEmailAddress: PropTypes.string.isRequired,
      profileIconUrl: PropTypes.string.isRequired,
      replayUnsubscribeUrl: PropTypes.string,
    }).isRequired,
  }

  renderSummonerSummary() {
    const { summonerName, region, division, profileIconUrl } = this.props.summoner;

    return (
      <div className="ui two column centered doubling grid container">
        <div className="column">
          <div className="ui items">
            <div className="item">
              <div className="ui tiny image">
                <img src={ profileIconUrl } />
              </div>
              <div className="middle aligned content">
                <span className="header">{ summonerName }</span>
                <div className="meta">
                  <span>{ region.toUpperCase() }</span> / <span>{ division }</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { registrationState, replayUnsubscribeUrl } = this.props.summoner;
    const RegistrationStateComponent = {
      [REGISTERED]: MatchList,
      [NOT_REGISTERED]: Registration,
      [REGISTRATION_PENDING]: Registration,
    }[registrationState];

    return (
      <div className="ui two column centered doubling grid container">
        <div className="column">
          { this.renderSummonerSummary() }

          <div className="ui hidden divider"></div>

          <div className="ui warning message">
            <p>For now, only replays of ranked games will be tracked. More queue types will be supported in the future.</p>
            <p>Please keep in mind that Replay.gg does not store replays forever, and will currently be deleted after 7 days of inactivity or 30 days maximum.</p>
          </div>

          <RegistrationStateComponent { ...this.props } />

          {
            registrationState === REGISTERED || replayUnsubscribeUrl ?
            <Deregister { ...this.props } /> :
            null
          }
        </div>
      </div>
    );
  }
}
