/*global __CLIENT__*/
import React, { Component } from 'react';

if (__CLIENT__) {
  require('./App.scss');
}

class App extends Component {
  render() {
    return (
      <div className="container app">
        <div className="app-content">
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default class AppContainer {
  render() {
    return (
      <App>
        { this.props.children }
      </App>
    );
  }
}
