/*global __CLIENT__*/
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isLoaded as isInfoLoaded } from '../reducers/info';
import { load as loadInfo } from '../actions/infoActions';

if (__CLIENT__) {
  require('./App.scss');
}

class App extends Component {
  render() {
    const { info } = this.props;

    return (
      <div className="container app">
        { info.loaded ? <strong>loaded</strong> : null }
        <div className="app-content">
          { this.props.children }
        </div>
      </div>
    );
  }
}

@connect(state => ({
  info: state.info,
}))
export default class AppContainer {
  static propTypes = {
    info: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
  }

  static fetchData(store) {
    const promises = [];
    if (!isInfoLoaded(store.getState())) {
      promises.push(store.dispatch(loadInfo()));
    }
    return Promise.all(promises);
  }

  render() {
    const { info } = this.props;
    return (
      <App info={ info }>
        { this.props.children }
      </App>
    );
  }
}
