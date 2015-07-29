/* global __CLIENT__ */
import React, { Component, PropTypes } from 'react';
import SummonerInfo from 'components/SummonerInfo';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getSummoner, isSummonerLoaded } from 'reducers/summoners';
import summonerActions from 'actions/summonerActions';

class Summoner extends Component {
  static propTypes = {
    summoner: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div>
        <SummonerInfo
          summoner={ this.props.summoner }
          { ...bindActionCreators(summonerActions, this.props.dispatch) }
        />
        <div className="ui hidden section divider"></div>
      </div>
    );
  }
}

@connect(state => ({
  summoners: state.summoners,
}))
export default class SummonerContainer extends Component {
  static propTypes = {
    params: PropTypes.shape({
      region: PropTypes.string.isRequired,
      summonerName: PropTypes.string.isRequired,
    }).isRequired,
    summoners: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  static fetchData(store, { region, summonerName }, { navigationType }) {
    if (!__CLIENT__ || navigationType === 'PUSH') {
      return store.dispatch(summonerActions.loadSummoner(region, summonerName));
    }
  }

  getSummoner() {
    const { region, summonerName } = this.props.params;
    return getSummoner(this.props.summoners, region, summonerName);
  }

  render() {
    const summoner = this.getSummoner();

    if (summoner && summoner.failed) {
      return (
        <div className="ui negative message">
          <div className="header">Something's wrong. Sorry!</div>
          <p>We were unable to load { summoner.summonerName }'s data.</p>
        </div>
      );
    } else if (!summoner || summoner.loading) {
      return <div className="ui active centered inline loader"></div>;
    } else {
      return <Summoner summoner={ summoner } { ...this.props } />;
    }
  }
}
