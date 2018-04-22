import React, { Component } from 'react';

class AutosaveText extends Component {
    render() {
        return (
            this.props.saving ?
                <div className="save" >Saving...</div> :
                <div className="save" >All changes saved.</div>
        );
    }
}

export default AutosaveText;
