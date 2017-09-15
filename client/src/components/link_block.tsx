import * as React from 'react';
import * as FontAwesome from 'react-fontawesome';
import { Link } from 'react-router';
import { Clipboard } from 'ts-clipboard';
import { Modal, ListGroupItem } from 'react-bootstrap';
import { EditLinkModal } from '../components';

interface Props {
  link: {
    url: string,
    original_url: string,
    key: string,
    visitors: number,
    title: string,
    timestamp: string
  }
}

interface State {
  showEditModal: boolean,
  link: any
}

export class LinkBlock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      showEditModal: false,
      link: props.link
    }

    this.hideModal = this.hideModal.bind(this)
    this.copyHandler = this.copyHandler.bind(this)
    this.editHandler = this.editHandler.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
  }

  render() {
    return (
      <ListGroupItem header={this.state.link.title}>
        <div className="row">
          <EditLinkModal
            show={this.state.showEditModal}
            onHide={this.hideModal}
            link={this.state.link}
            reloadComponent={this.render}
            updateTitle={this.updateTitle}
          />
          <div className="col-xs-12 col-sm-8 block_body">
            <div className="central_part">
              <div className="link">
                <a href={this.state.link.url}>{this.state.link.url}</a>
              </div>
              <button onClick={this.editHandler} className="block_btn btn btn-default"><FontAwesome name="pencil" /> edit</button>
              <button onClick={this.copyHandler} className="block_btn btn btn-default"><FontAwesome name="clipboard" /> copy</button>
            </div>
            <div className="block_footer text-left">
              <span>{this.state.link.timestamp}</span>
            </div>
          </div>
          <div className="col-xs-12 col-sm-4">
            <div className="row block_vis_row">
              <div className="col-xs-5">
                <div className="block_visitors">
                  {this.state.link.visitors}
                </div>
              </div>
              <div className="col-xs-7 block_vis_info">
                <div>visitors</div>
                <br/>
                <div>last seen: 5 min ago</div>
              </div>
            </div>
            <div className="row block_vis_link">
              <div className="col-xs-12 text-right">
                <Link to={"/k/" + this.state.link.key}>
                  <FontAwesome name="bar-chart" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ListGroupItem>
    )
  }

  private hideModal() {
    this.setState({ showEditModal: false })
  }

  private updateTitle(link: any) {
    this.setState({
      showEditModal: false,
      link: link
    })
  }

  private editHandler() {
    this.setState({ showEditModal: true })
  }

  private copyHandler() {
    Clipboard.copy(this.state.link.url)
  }
}