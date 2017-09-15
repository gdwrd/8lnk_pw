import * as React from 'react';
import { Modal, Button, FormControl, FormGroup } from 'react-bootstrap';

interface Props {
  link: any,
  show: any,
  onHide: any,
  reloadComponent: any,
  updateTitle: any
}

interface State {
  title: string
}

export class EditLinkModal extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      title: null
    }

    this.updateTitle = this.updateTitle.bind(this)
    this.handleTitleField = this.handleTitleField.bind(this)
  }

  render() {
    return(
      <Modal onHide={this.props.onHide} show={this.props.show} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">EDIT LINK TITLE</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12">
              <FormGroup>
                <input 
                  type="text"
                  className="form-control"
                  placeholder={this.props.link.title}
                  onChange={this.handleTitleField}
                />
              </FormGroup>
            </div>
            <div className="col-xs-12 text-center">
              <Button className="edit_modal_btn" bsSize="large" bsStyle="primary" onClick={this.updateTitle} type="submit">Save</Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  private handleTitleField(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ title: e.target.value })
  }

  private updateTitle() {
    let that = this;

    fetch("/u_title", {
      headers: {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify({
        key: this.props.link.key,
        title: this.state.title
      })
    }).then(function(response) {
      return response.json()
    }).then(function(body) {
      that.props.updateTitle(body)
    }).catch(function(error) {
      console.log(error)
    })
  }
}