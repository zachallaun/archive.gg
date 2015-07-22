/*global __CLIENT__*/
import React, { Component, PropTypes } from 'react';
import { TransitionHook } from 'react-router';
import { createTransitionHook } from 'universalRouter';

if (__CLIENT__) {
  require('!style!css!dist/semantic.css');
  require('./App.scss');
}

class App extends Component {
  render() {
    return (
      <div className="ui container">
        { this.props.children }
      </div>
    );
  }
}

const AppContainer = React.createClass({
  mixins: [
    TransitionHook,
  ],

  contextTypes: {
    store: PropTypes.object,
  },

  routerWillLeave(...args) {
    if (!this.transitionHook) {
      this.transitionHook = createTransitionHook(this.context.store);
    }

    this.transitionHook(...args);
  },

  render() {
    return (
      <App>
        { this.props.children }
      </App>
    );
  },
});

export default AppContainer;
