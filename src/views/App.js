/*global __CLIENT__*/
import React, { Component, PropTypes } from 'react';
import { Link, TransitionHook } from 'react-router';
import { createTransitionHook } from 'utils/universalRouter';

const style = {
  flexDirectionColumn: {
    WebkitBoxDirection: 'normal',
    WebkitBoxOrient: 'vertical',
    WebkitFlexDirection: 'column',
    MozFlexDirection: 'column',
    msFlexDirection: 'column',
    flexDirection: 'column',
  },

  flex1: {
    WebkitBoxFlex: 1,
    WebkitFlex: 1,
    MozBoxFlex: 1,
    MozFlex: 1,
    mxFlex: 1,
    flex: 1,
  },
};

class App extends Component {
  render() {
    return (
      <div id="archivegg-app-1" style={{ minHeight: '100vh', ...style.flexDirectionColumn }}>
        <div className="ui center aligned very padded basic teal segment">
          <Link className="ui huge teal header" to="/">
            archive.gg<sup style={{ top: '-.75em', fontSize: '50%' }}>beta</sup>
          </Link>
          <div className="sub header">League of Legends replay archive</div>
        </div>

        <div className="ui container" style={ style.flex1 }>
          { this.props.children }
        </div>

        <div className="ui center aligned basic footer segment">
          <ul className="ui celled horizontal link list">
            <a className="item" href="http://replay.gg">
              With thanks to Replay.gg
            </a>
            <a className="item" href="mailto:zach@archive.gg">
              Feedback or Questions
            </a>
            <a className="item" href="https://github.com/zachallaun/archive.gg">
              Code on GitHub
            </a>
          </ul>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          #archivegg-app-1 {
            display: -webkit-box;
            display: -webkit-flex;
            display: -moz-flex;
            display: -ms-flexbox;
            display: flex;
          }
        `,
        }}/>
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
