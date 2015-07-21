import React, { Component, PropTypes } from 'react';
import RegionNames from 'constants/regions';

class SummonerNav extends Component {
  static propTypes = {
    region: PropTypes.string,
    summonerName: PropTypes.string,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  constructor({ region, summonerName }) {
    super();
    this.state = {
      region: region || RegionNames.NA,
      summonerName: summonerName || '',
    };
  }

  navigate(e) {
    e.preventDefault();
    const { region, summonerName } = this.state;
    this.context.router.transitionTo(`/${region}/${summonerName}`);
  }

  summonerNameChanged(e) {
    this.setState({ summonerName: e.target.value });
  }

  render() {
    return (
      <div>
        <form onSubmit={ ::this.navigate }>
          <input
            type="text"
            value={ this.state.summonerName }
            onChange={ ::this.summonerNameChanged }
            placeholder="Summoner Name"
          />
        </form>

        { this.props.children }
      </div>
    );
  }
}

export default class SummonerNavContainer extends Component {
  static propTypes = {
    params: PropTypes.shape({
      region: PropTypes.string,
      summonerName: PropTypes.string,
    }).isRequired,
  }

  render() {
    const { region, summonerName } = this.props.params;

    return <SummonerNav region={ region } summonerName={ summonerName } { ...this.props } />;
  }
}
