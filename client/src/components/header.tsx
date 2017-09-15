import * as React from 'react';
import { Link } from 'react-router';
import { Nav, Navbar, NavItem, MenuItem, NavDropdown, Dropdown } from 'react-bootstrap';
import { LoginModal } from '../components';

interface State {
  user: any,
  user_profile: any,
  showLogin: boolean
}

export class Header extends React.Component<undefined, State> {
  constructor() {
    super()

    var cacheUser = localStorage.getItem("user")
    var cacheUserProfile = localStorage.getItem("user_profile")
    if (cacheUser && cacheUserProfile)
      cacheUser = JSON.parse(cacheUser)
      cacheUserProfile = JSON.parse(cacheUserProfile)

    this.state = { 
      user: cacheUser, 
      user_profile: cacheUserProfile,
      showLogin: false 
    }

    this.showLogin = this.showLogin.bind(this)
    this.hideLogin = this.hideLogin.bind(this)
    this.setUser = this.setUser.bind(this)
    this.setUserProfile = this.setUserProfile.bind(this)
  }

  public render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">
              <img className="header_logo" src="/site/img/logo_header.png" alt="8lnk.pw Logo"/>
            </Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavItem eventKey={1} href="#/">LINKS</NavItem>
          <NavItem eventKey={2} href="#/statistics">STATS</NavItem>
          <NavItem eventKey={2} href="https://nsheremet.pw">BLOG</NavItem>
          <NavItem eventKey={2} href="#/about">ABOUT</NavItem>
        </Nav>
        {this.userMenu()}
      </Navbar>
    )
  }

  private userMenu() {
    const userPhoto = (
      <img src="/" alt=""/>
    )

    if (!!(this.state.user_profile)) {
      return (
        <Nav pullRight>
          <NavItem eventKey={2} href="#/profile">PROFILE</NavItem>
          <NavDropdown eventKey={3} title={this.state.user_profile.name} id="basic-nav-dropdown">
            <MenuItem eventKey={3.1} href="#/profile">PROFILE</MenuItem>
            <MenuItem eventKey={3.2} href="#/settings">SETTINGS</MenuItem>
            <MenuItem eventKey={3.3} href="#/donate">DONATE</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.4}>SIGN OUT</MenuItem>
          </NavDropdown>
        </Nav>
      )
    } else {
      return (
        <Nav pullRight>
          <LoginModal 
            setUser={this.setUser} 
            setUserProfile={this.setUserProfile} 
            show={this.state.showLogin} 
            onHide={this.hideLogin} 
          />
          <NavItem eventKey={2} onClick={this.showLogin}>SIGN IN</NavItem>
          <NavItem eventKey={2} onClick={this.showLogin}>SIGN UP</NavItem>
        </Nav>
      )
    }
  }

  private showLogin() {
    this.setState({ showLogin: true })
  }

  private hideLogin() {
    this.setState({ showLogin: false })
  }

  private setUser(data: any) {
    localStorage.setItem("user", JSON.stringify(data))

    this.setState({
      user: data
    })
  }

  private setUserProfile(data: any) {
    let that = this;

    fetch("/user_login", {
      headers: {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(function(response) {
      return response.json()
    }).then(function(body) {
      that.setState({
        user_profile: body
      })

      localStorage.setItem("user_profile", JSON.stringify(body))
    }).catch(function(error) {
      console.log(error)
    })
  }
}