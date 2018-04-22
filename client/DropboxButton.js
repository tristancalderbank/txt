import React, { Component } from 'react';

class DropboxButton extends Component {
    render() {
        return (
            <a className="dropbox-button" href={this.props.authUrl}>
                <img className="dropbox-logo" src={'https://dl.dropboxusercontent.com/content_link/fW4j3jPHWK5Gpr2dMtSKmQGahUu1MfYJWFqOJ6uJ04CthvTxx4lkHlzMU3WNWQne/file?dl=0&duc_id=Z1DMSXSsntSfm0nsmZxWNK9wNVkelxBtfcMdBaQjspUA0keFznHieC92HIYTdpwd&raw=1&size=1280x960&size_mode=3'}></img>
                <div className="dropbox-button-text">Connect to Dropbox</div>
            </a>
        );
    }
}

export default DropboxButton;
