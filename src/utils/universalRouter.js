import _ from 'lodash';
import React from 'react';
import Router from 'react-router';
import routes from 'views/routes';
import { Provider } from 'react-redux';

const getFetchData = (component) => {
  return component.fetchData || (component.DecoratedComponent && component.DecoratedComponent.fetchData);
};

export function createTransitionHook(store) {
  return (nextState, transition, callback) => {
    Promise.all(nextState.branch
      .map(route => route.component)
      .filter(component => {
        return getFetchData(component);
      })
      .map(getFetchData)
      .map(fetchData => {
        return fetchData(store, _.mapValues(nextState.params, decodeURI), nextState.location);
      }))
      .then(() => {
        if (callback) callback(); // can't just pass callback to then() because callback assumes first param is error
      }, (error) => {
        if (callback) callback(error);
      });
  };
}

export default function universalRouter(location, history, store) {
  return new Promise((resolve, reject) => {
    const hook = createTransitionHook(store);
    Router.run(routes, location, [hook], (error, initialState) => {
      if (error) {
        reject(error);
      } else {
        if (history) {  // only on client side
          initialState.history = history;
        }
        resolve(<Provider store={store} key="provider">
          {() => <Router {...initialState} children={routes}/>}
        </Provider>);
      }
    });
  });
}
