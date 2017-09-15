import * as React from 'react';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import { Modal, Button } from 'react-bootstrap';
import * as FontAwesome from 'react-fontawesome';

interface Props {
  onHide: any,
  show: any,
  setUserProfile: any,
  setUser: any
}

export class LoginModal extends React.Component<Props, undefined> {
  constructor() {
    super()

    this.responseFacebook = this.responseFacebook.bind(this)
    this.responseGoogle = this.responseGoogle.bind(this)
  }

  public render() {
    return (
      <Modal onHide={this.props.onHide} show={this.props.show} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">SIGN IN OR SIGN UP HERE</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12 col-sm-6 col-sm-offset-3">
              <FacebookLogin
                appId="1375114819253493"
                autoLoad={true}
                fields="name,email,picture"
                callback={this.responseFacebook}
                icon={<FontAwesome name="facebook-square" />} 
              />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-6 col-sm-offset-3">
              <GoogleLogin
                clientId="740821855677-9bm4492e6hoppcub814kqlfhnehcrpns.apps.googleusercontent.com"
                onSuccess={this.responseGoogle}
                onFailure={this.responseGoogle}
                className="google_login_btn"
              >
                <FontAwesome
                  name='google'
                />
                <span> LOGIN WITH GOOGLE</span>
              </GoogleLogin>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  private responseGoogle(response: any) {
    var userProfile = {
      email: response.profileObj.email,
      name: response.profileObj.name,
      social_id: response.profileObj.googleId,
      social_provider: "google",
      image_url: response.profileObj.imageUrl
    }

    this.props.setUserProfile(userProfile)
    
    var userData = {
      accessToken: response.tokenObj.access_token,
      expiresIn: response.tokenObj.expires_in,
      user_id: response.googleId
    }
    this.props.setUser(userData)
  }

  private responseFacebook(response: any) {
    var userProfile = {
      email: response.email,
      name: response.name,
      social_id: response.id,
      social_provider: "facebook",
      image_url: response.picture.data.url
    }

    this.props.setUserProfile(userProfile)

    var userData = {
      accessToken: response.accessToken,
      expiresIn: response.expiresIn,
      user_id: response.id,
      signedRequest: response.signedRequest
    }
    this.props.setUser(userData)
  }
}

