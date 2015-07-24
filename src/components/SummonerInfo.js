import React, { Component, PropTypes } from 'react';
import ZeroClipboard from 'react-zeroclipboard';
import classSet from 'react-classset';
import { REPLAY_GG_URL } from 'constants/misc';
import {
  NOT_REGISTERED,
  REGISTRATION_PENDING,
  REGISTERED,
} from 'constants/registrationStates';

class Registered extends Component {
  render() {
    return <h1>registered</h1>;
  }
}

class CopyableArchiveEmailAddress extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.state = {
      showPopup: false,
    };
  }

  onCopy(e) {
    const { target } = e;

    this.setState({ showPopup: true });
    setTimeout(() => {
      this.setState({ showPopup: false });
      target.blur();
    }, 1000);
  }

  render() {
    const { value } = this.props;

    const popupClassName = classSet({
      'ui inverted tiny popup top left': true,
      'visible': this.state.showPopup,
    });

    return (
      <div style={{ position: 'relative' }}>
        <div className={ popupClassName } style={{ top: -50, left: 5, right: 'initial' }}>
          Copied!
        </div>
        <div className="ui fluid left action input">
          <ZeroClipboard text={ value }>
            <button className="ui teal left labeled icon button" onClick={ ::this.onCopy }>
              <i className="copy icon"></i>
              Copy
            </button>
          </ZeroClipboard>
          <input value={ value } type="text" readOnly />
        </div>
      </div>
    );
  }
}

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

        <div className="ui segment mini grey labels">
          <div className="ui ribbon label">Step 1</div>
          <hr style={{ visibility: 'hidden' }} />
          <CopyableArchiveEmailAddress value={ archiveEmailAddress } />

          <div className="ui divider"></div>

          <div className="ui ribbon label">Step 2</div>
          <hr style={{ visibility: 'hidden' }} />
          <a className="ui teal submit button" href={ REPLAY_GG_URL } target="_blank">
            Sign up on replay.gg
          </a>

          <div className="ui divider"></div>

          <div className="ui ribbon label">Step 3</div>
          <hr style={{ visibility: 'hidden' }} />
          {
            this.state.showWaiting ?
            <div className="ui disabled button">
              <i className="ui active small inline indeterminate loader"></i>
              <span style={{ marginLeft: '1em' }}>Waiting on games from replay.gg – go play some LoL!</span>
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
