import * as React from 'react';
import { App } from './app';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { Profile, About, MainPage } from './pages';

export const AppRouter: React.StatelessComponent<{}> = () => {
  return (
    <Router history={hashHistory}>
      <Route path="/" component={App} >
        <IndexRoute component={MainPage} />
        <Route path="/about" component={About} />
        <Route path="/profile" component={Profile} />
      </Route>
    </Router>
  );
}


