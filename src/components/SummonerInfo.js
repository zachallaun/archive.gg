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

class Pending extends Component {
  render() {
    return (
      <div>
        <div className="ui hidden section divider"></div>
        <div className="ui basic segment">
          <div className="ui active indeterminate text loader">Waiting on games from replay.gg.<br/>Check back later.</div>
        </div>
      </div>
    );
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

  render() {
    const { archiveEmailAddress } = this.props.summoner;

    return (
      <div className="content">
        <h5>How it works</h5>

        <p>
          Archive.gg works in tandem with <a href={ REPLAY_GG_URL } target="_blank">Replay.gg</a>. To track recorded games, you need to sign up for Replay.gg using the email address provided below. Once that's done, you'll be able to see a list of recorded games with links to the match history and Replay.gg recording.
        </p>

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
          <button className="ui teal submit button" onClick={ this.props.onRegisterAttempt }>
            Click here after signup
          </button>
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
    const { registrationState } = this.props.summoner;

    return (
      <div>
        <div className="ui hidden divider"></div>
        {
          registrationState === NOT_REGISTERED ?
          <Register
            summoner={ this.props.summoner }
            onRegisterAttempt={ ::this.attemptRegister }
          /> :
          <Pending
            summoner={ this.props.summoner }
          />
        }
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
