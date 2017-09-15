import * as React from 'react';
import { App } from './app';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { Main, Stats, About, Profile, Settings, Donate } from './pages';

export const AppRouter: React.StatelessComponent<{}> = () => {
  return (
    <Router history={hashHistory}>
      <Route path="/" component={App} >
        <IndexRoute component={Main} />
        <Route path="/statistics" component={Stats}/>
        <Route path="/about" component={About} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/donate" component={Donate} />
      </Route>
    </Router>
  );
}


