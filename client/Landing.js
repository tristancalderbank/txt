import React, { Component } from 'react';

class Landing extends Component {
    render() {
        return (
            <div className="page">
                <a href={this.props.authUrl}>Auth</a>
            </div>
        );
    }
}

export default Landing;
