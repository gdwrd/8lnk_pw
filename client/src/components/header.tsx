import * as React from 'react';
import { Col, Navbar } from 'react-bootstrap';
import { Link } from 'react-router';

export const Header: React.StatelessComponent<{}> = () => {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to="/">8LNK.PW</Link>
        </Navbar.Brand>
      </Navbar.Header>
      <div className="nav navbar-right header-links">
        <Link to="/about">About</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/signin">Sign In</Link>
      </div>
    </Navbar>
  )
}
