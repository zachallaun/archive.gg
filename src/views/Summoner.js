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

  static fetchData(store, { region, summonerName }) {
    if (!isSummonerLoaded(store.getState().summoners, region, summonerName)) {
      return store.dispatch(summonerActions.load(region, summonerName));
    } else {
      return [];
    }
  }

  getSummoner() {
    const { region, summonerName } = this.props.params;
    return getSummoner(this.props.summoners, region, summonerName);
  }

  render() {
    const summoner = this.getSummoner();

    if (summoner && !summoner.loading) {
      return <Summoner summoner={ summoner } { ...this.props } />;
    } else {
      return <div className="ui active centered inline loader"></div>;
    }
  }
}