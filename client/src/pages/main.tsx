import * as React from 'react';
import { ListGroup, ListGroupItem, FormGroup, FormControl, ControlLabel, HelpBlock, Tooltip, Overlay } from 'react-bootstrap';

import { LinkBlock } from '../components';

interface State {
  user: any,
  item: {
    url: string
  },
  typingStarted: boolean,
  tempUserLinkIDs: string[],
  Links: any
}

export interface Props { user: any }

export class Main extends React.Component<Props, State> {
  constructor() {
    super()

    var str = localStorage.getItem("ids")

    if (str)
      var ids = str.split(" ")
    else
      var ids = [] as string[];

    this.state = {
      item: { url: "" },
      user: null,
      typingStarted: false,
      tempUserLinkIDs: ids,
      Links: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.OnKeyPress = this.OnKeyPress.bind(this)
  }

  componentDidMount() {
    let that = this;

    fetch("/links_data", {
      headers: {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ "links" : that.state.tempUserLinkIDs })
    }).then(function(response) {
      return response.json()
    }).then(function(body) {
      that.setState({
        Links: body
      })
    })
  }

  public render() {
    return(
      <div className="main-container">
        <h2>LINKS</h2>
        <div className="add_item">
          <div className="row">
            <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
              <form className="add_item__form" id="target">
                <FormGroup>
                  <input 
                    type="text"
                    className="form-control add_item__field"
                    placeholder="Paste a link to shorten it"
                    onChange={this.handleChange}
                    onKeyPress={this.OnKeyPress}
                    value={this.state.item.url}
                  />

                  <Overlay 
                    placement="right"
                    show={this.state.typingStarted}
                    target={() => document.getElementById("target")}
                  >
                    <Tooltip placement="right" className="in" id="tooltip-right">and press Enter</Tooltip>
                  </Overlay>
                  
                  <FormControl.Feedback />
                </FormGroup>
              </form>
            </div>
          </div>
        </div>    
        {this.LinksList()}
      </div>
    )
  }

  private LinksList() {
    if (!!(this.state.Links)) {
      return (
        <ListGroup>
          {this.state.Links.map((link: any) =>
            <LinkBlock key={link.key} link={link} />
          )}
        </ListGroup>
      )
    } else {
      return (
        <div>Loading</div>
      )
    }
  }

  private sendToShorten() {
    let that = this;

    fetch("/shorten", {
      headers: {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ url: this.state.item.url })
    }).then(function(response) {
      return response.json()
    }).then(function(body) {
      var data = that.state.tempUserLinkIDs.concat([body.url])
      var Links = that.state.Links.concat([body])

      that.setState({
        tempUserLinkIDs: data,
        Links: Links
      })

      localStorage.setItem("ids", data.join(" "))
    }).catch(function(error) {
      console.log(error)
    })
  }

  private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    var typingStarted = false

    if (!this.state.typingStarted) 
      typingStarted = true    

    this.setState({
      typingStarted: typingStarted,
      item: { url: e.target.value }
    })
  }

  private OnKeyPress(e: React.KeyboardEvent<{}>): any {
    if (e.key == "Enter") {
      this.sendToShorten()
      this.setState({ item: { url: "" } })
    }
  }
}