import * as React from 'react';
import * as FontAwesome from 'react-fontawesome';
import { Panel } from 'react-bootstrap';
import { Clipboard } from 'ts-clipboard';

export interface EntityBlockProps { url: string, original_url: string, visitors: string, timestamp: string, title: string }

export class EntityBlock extends React.Component<EntityBlockProps, undefined> {
  constructor() {
    super()

    this.CopyLink = this.CopyLink.bind(this);
  }

  render() {
    return (
      <Panel footer={this.footerBlock()} header={this.headerBlock()} bsStyle="success" className="entity_block">
        <div className="row">
          <div className="col-xs-12">
            <a href={this.props.original_url}>{this.props.original_url}</a>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-9">
            <a href={this.props.url}>{this.props.url}</a>
            <button onClick={this.CopyLink} className="btn btn-xs btn-success copy-link">copy link</button>
          </div>
          <div className="col-xs-3 entity_block__vis">{this.props.visitors} <FontAwesome name="bar-chart"/></div>
        </div>
      </Panel>
    )
  }

  public CopyLink() {
    Clipboard.copy(this.props.url)
  }

  private footerBlock() {
    return this.props.timestamp;
  }  

  private headerBlock() {
    return <a href={this.props.url}>{this.props.title}</a>;
  }
}