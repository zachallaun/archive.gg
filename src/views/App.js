/*global __CLIENT__*/
import React, { Component, PropTypes } from 'react';
import { TransitionHook } from 'react-router';
import { createTransitionHook } from 'universalRouter';

if (__CLIENT__) {
  require('./App.scss');
}

class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="app__content">
          { this.props.children }
        </div>
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
