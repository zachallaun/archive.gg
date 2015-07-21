import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getSummoner, isSummonerLoaded } from 'reducers/summoners';
import { load as loadSummoner } from 'actions/summonerActions';

class Summoner extends Component {
  static propTypes = {
    summonerName: PropTypes.string.isRequired,
    division: PropTypes.string.isRequired,
  }

  render() {
    const { summonerName, division } = this.props;

    return <h1>summoner { summonerName }: { division }</h1>;
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
      return store.dispatch(loadSummoner(region, summonerName));
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
      return <Summoner { ...summoner } />;
    } else {
      return <span>Loading...</span>;
    }
  }
}
