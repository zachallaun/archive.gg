import React, { Component, PropTypes } from 'react';
import CopyableField from 'components/CopyableField';
import classSet from 'react-classset';
import {
  SUMMONER_DEREGISTER,
  SUMMONER_DEREGISTER_SUCCESS,
  SUMMONER_DEREGISTER_FAIL,
} from 'constants/actionTypes';

export default class Deregister extends Component {
  static propTypes = {
    summoner: PropTypes.shape({
      region: PropTypes.string.isRequired,
      summonerName: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      replayUnsubscribeUrl: PropTypes.string,
      deregisterState: PropTypes.string,
    }),
    deregisterSummoner: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.state = {
      opened: false,
    };
  }

  deregister() {
    this.props.deregisterSummoner(this.props.summoner);
  }

  renderForm() {
    const { token, deregisterState } = this.props.summoner;

    const formClassName = classSet({
      'ui form': true,
      'error': deregisterState === SUMMONER_DEREGISTER_FAIL,
    });

    const buttonClassName = classSet({
      'ui fluid teal submit button': true,
      'loading': deregisterState === SUMMONER_DEREGISTER,
    });

    return (
      <div>
        <p>To prove your identity, please rename one of your rune pages to the following:</p>
        <div className={ formClassName }>
          <div className="field">
            <CopyableField value={ token } />
          </div>
          <div className="ui error message">
            <div className="header">Could not confirm your identity</div>
            <p>Please make sure you've renamed a rune page using the token above.</p>
          </div>
          <button className={ buttonClassName } onClick={ ::this.deregister }>
            Done, unsubscribe
          </button>
        </div>
      </div>
    );
  }

  renderUrl() {
    const { replayUnsubscribeUrl } = this.props.summoner;

    if (replayUnsubscribeUrl) {
      return (
        <a className="ui fluid teal button"
           href={ this.props.summoner.replayUnsubscribeUrl }
           target="_blank">
          Unsubscribe on replay.gg to complete the process.
        </a>
      );
    } else {
      return (
        <div>
          <div className="ui red header">Cannot unsubscribe at this time!</div>
          <p>
            We can't get replay.gg's unsubscribe URL until you play at least one ranked game. Sorry! Please check back after playing a game.
          </p>
        </div>
      );
    }
  }

  renderDetails() {
    const { deregisterState } = this.props.summoner;

    return (
      <div className="ui segment">
        {
          !deregisterState || deregisterState !== SUMMONER_DEREGISTER_SUCCESS ?
          this.renderForm() :
          this.renderUrl()
        }
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="ui hidden divider" />
        <button className="ui mini basic red button"
                onClick={ () => this.setState({ opened: !this.state.opened }) }>
          Unsubscribe
        </button>
        { this.state.opened ? this.renderDetails() : null }
      </div>
    );
  }
}
