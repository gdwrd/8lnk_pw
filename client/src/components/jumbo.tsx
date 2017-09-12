import * as React from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import * as FontAwesome from 'react-fontawesome';

export const Jumbo: React.StatelessComponent<{}> = () => {
  return (
    <Jumbotron>
      <h1>THE LINK KNOWS ALL. SO CAN YOU</h1>
      <p>Links are everywhere. Within every channel and every platform. Only 8LNK are powerful enough to allow you to see clear across the internet.</p>
      <p>Measure your links with 8LNK, the world's leading link management platform</p>
      <p><Button bsStyle="info">LEANR MORE</Button></p>
    </Jumbotron>
  )
}