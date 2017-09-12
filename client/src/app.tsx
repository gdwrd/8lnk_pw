import * as React from 'react';
import { Header } from './components';

export const App: React.StatelessComponent<{}> = (props) => {
  return (
    <div className="wrap">
      <Header/>
      {props.children}
    </div>
  )
}