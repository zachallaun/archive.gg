/*global __CLIENT__*/
import React, { Component, PropTypes } from 'react';
import { Link, TransitionHook } from 'react-router';
import { createTransitionHook } from 'utils/universalRouter';

if (__CLIENT__) {
  require('!style!css!dist/semantic.css');
}

class App extends Component {
  render() {
    return (
      <div>
        <div className="ui center aligned very padded basic teal segment">
          <Link className="ui huge teal header" to="/">archive.gg</Link>
          <div className="sub header">League of Legends replay archive</div>
        </div>

        <div className="ui container">
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
