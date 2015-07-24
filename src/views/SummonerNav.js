import React, { Component, PropTypes } from 'react';
import Dropdown from 'components/Dropdown';
import RegionNames from 'constants/riot/regions';

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
      region: (region && region.toUpperCase()) || RegionNames.NA,
      summonerName: summonerName || '',
    };
  }

  navigate(e) {
    e.preventDefault();
    const { region, summonerName } = this.state;
    this.context.router.transitionTo(`/${region.toLowerCase()}/${summonerName}`);
  }

  regionChanged(region) {
    this.setState({ region });
  }

  summonerNameChanged(e) {
    this.setState({ summonerName: e.target.value });
  }

  render() {
    return (
      <div>
        <div className="ui two column centered grid">
          <div className="column">
            <form className="ui large form" onSubmit={ ::this.navigate }>
              <div className="ui raised segment">
                <div className="field">
                  <div className="ui large left labeled icon input">
                    <Dropdown
                      className="label"
                      selected={ this.state.region }
                      items={ Object.keys(RegionNames) }
                      onSelect={ ::this.regionChanged }
                    />

                    <input
                      className="prompt"
                      type="text"
                      value={ this.state.summonerName }
                      onChange={ ::this.summonerNameChanged }
                      placeholder="Summoner name..."
                      autoFocus
                    />
                    <i className="circular teal search icon"></i>
                  </div>
                </div>

                <button className="ui fluid large teal submit button" onClick={ ::this.navigate }>
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
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

    return (
      <div>
        <SummonerNav region={ region } summonerName={ summonerName } />
        {
          this.props.children ?
          <div>
            <div className="ui section divider" key="divider"></div>
            { this.props.children }
          </div> :
          null
        }
      </div>
    );
  }
}
