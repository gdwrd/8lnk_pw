import * as React from "react";
import { Link } from 'react-router';
import { FormGroup, InputGroup, Button, FormControl, Well } from 'react-bootstrap';
import * as FontAwesome from 'react-fontawesome';

import { Jumbo, EntityBlock } from '../components';
import { User } from '../models/user';

interface State {
  user: User;
  newEntity: {
    url: string
  }
  newAddedEntity: any
}

export class MainPage extends React.Component<{}, State> {
  constructor() {
    super();
    this.state = { 
      user: {id: null, email: null, links: []},
      newEntity: { url: '' },
      newAddedEntity: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({newEntity: { url: e.target.value }})
  }

  public handleSubmit() {
    let that = this;

    fetch("/shorten", {
      headers: {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        url: this.state.newEntity.url
      })
    }).then(function(response){
      return response.json();
    })
    .then(function(body) {
      that.setState({ newAddedEntity: body });
    })
    .catch(function(res){ console.log(res) })
  }

  public render() {
    if (this.state.user.id == null) {
      var jumbo = <Jumbo/>
    } else {
      var jumbo = <div></div> // TODO: add last 5 added links
    }

    return (
      <div className="main-page">
        <div className="container">
          {jumbo}
        </div>
        <div className="row add-new-link">
          <div className="container">
            <div className="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 new-link">
              <h2 className="text-center">UNLEASH THE POWER OF THE 8LNK</h2>
              <h3 className="text-center">Keep track of all your links and how they travel across the web</h3>
              <form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <InputGroup bsSize="large">
                    <input className="form-control" onChange={this.handleChange} type="text" placeholder="https://www.example.com/..."/>
                    <InputGroup.Button>
                      <Button type="submit" bsSize="large" bsStyle="info" >SHORTEN</Button>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
              </form>
              <div className="new_added">
                <EntityBlock 
                  url="https://8lnk.pw/me" 
                  original_url="https://nsheremet.pw/" 
                  visitors="3583"
                  timestamp="10 Jul 12:23" 
                  title="NSheremet.pw"
                />
                {this.checkAddedEntity()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  private checkAddedEntity() {
    if (!!(this.state.newAddedEntity)) {
      return (
        <div>
          <Well>Your first link succesfully created! 👍</Well> 
          <EntityBlock 
            url={this.state.newAddedEntity.url} 
            original_url={this.state.newAddedEntity.original_url} 
            visitors={this.state.newAddedEntity.visitors}
            timestamp={this.state.newAddedEntity.timestamp} 
            title={this.state.newAddedEntity.title}
          />
        </div>
      )
    }
  }
}