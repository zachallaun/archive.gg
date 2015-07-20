import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isLoaded as isInfoLoaded } from '../reducers/info';
import { load as loadInfo } from '../actions/infoActions';

@connect(state => ({
  info: state.info,
}))
export default class Home extends Component {
  static propTypes = {
    info: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.reload = this.reload.bind(this);
  }

  reload() {
    this.props.dispatch(loadInfo());
  }

  render() {
    const { info } = this.props;

    return (
      <div>
        <h1>Home...</h1>
        { info.loaded ? `${info.data.message}:${info.data.time}` : null }
        <button onClick={ this.reload }>Reload</button>
      </div>
    );
  }
}
