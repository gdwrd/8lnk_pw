import * as React from 'react';
import { Header, Footer } from './components'

export const App: React.StatelessComponent<{}> = (props) => {
  return (
    <div className="container">
      <Header/>
      <div className="page-content">
        {props.children}
      </div>
      <Footer/>
    </div>
  )
}