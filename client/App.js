import React, { Component } from 'react';
import Dropbox from 'dropbox';
import Scrollbars from 'react-custom-scrollbars';
import Landing from './Landing';
import config from '../config';
import utils from './utils';
import DBX from './dropbox';
import _ from 'lodash';

class App extends Component {
    constructor(props) {
        super(props);

        const accessToken = utils.getAccessTokenFromUrl();
        let authUrl;

        if (!accessToken) {
            this.dbx = new Dropbox.Dropbox({ clientId: config.DBX.clientID });
            authUrl = this.dbx.getAuthenticationUrl('http://localhost:3000/auth');
        } else {
            this.dbx = new DBX(new Dropbox.Dropbox({ accessToken }));
        }

        this.state = {
            name: '',
            text: '',
            saving: false,
            saved: false,
            files: [],
            fontSize: 1.1,
            accessToken: null,
            authUrl,
            accessToken,
            selectedFileName: null
        };
    }

    componentDidMount() {
        document.onkeydown = this.handleKeyPress.bind(this);

        if (this.state.accessToken) {
            this.dbx.getAllFiles()
                .then((files) => {
                    const firstFile = Object.keys(files)[0];

                    this.setState({
                        files
                    });

                    this.setSelectedFile(firstFile);
                });
        }
    }

    handleKeyPress(e) {
        const event = e;
        // CTRL +
        if (event.keyCode === 187 && event.ctrlKey) {
            this.setState({ fontSize: this.state.fontSize + 0.1 });
        }
        // CTRL -
        if (event.keyCode === 189 && event.ctrlKey) {
            this.setState({ fontSize: Math.max(this.state.fontSize - 0.1, 0.1) });
        }
    }

    handleSave() {
        this.setState({ saving: true });
    }

    setFileName(name) {
        document.title = name;

        const files = this.state.files;
        const nameWithExt = `${name}.txt`;

        // if name is different, create new file with that name
        if (!files[nameWithExt]) {
            files[nameWithExt] = _.cloneDeep(files[this.state.selectedFileName]);
        }

        this.setState({ selectedFileName: nameWithExt, files });
        window.history.pushState(name, name, `/${name}`);
    }

    handleNameEdit(e) {
        this.setFileName(e.target.value);
    }

    handleTextEdit(e) {
        const files = this.state.files;
        files[this.state.selectedFileName].contents = e.target.value;
        this.setState({ files, saved: false });
    }

    setSelectedFile(name) {
        this.setState({
            selectedFileName: name
        });

        this.fileNameInput.value = name.split('.')[0];
    }

    getFileNameInputRef(e) {
        if (e) {
            this.fileNameInput = e;
        }
    }


    render() {
        if (!this.state.accessToken) {
            return (<Landing
                authUrl={this.state.authUrl}
            />);
        }

        const fileNames = Object.keys(this.state.files);

        return (
            <div className="page">
                <div className="page-left">
                    <div className="logo">.txt</div>
                    {fileNames.map((name, i) => (
                        <div
                            key={i}
                            className="file"
                            onClick={this.setSelectedFile.bind(this, name)}
                        >
                            {name.split('.')[0]}
                        </div>
                    ))}
                </div>
                <div className="page-right">
                    <div className="toolbar">
                        <span className="name-text">name:</span>
                        <input
                            className="name"
                            onBlur={this.handleNameEdit.bind(this)}
                            ref={this.getFileNameInputRef.bind(this)}
                        ></input>
                        {this.state.saved ? <div className="saved">Changes saved.</div> : null}
                        {this.state.saving ?
                            <div className="save" >saving</div> :
                            <div className="save" onClick={this.handleSave.bind(this)}>save</div>
                        }
                    </div>
                    <Scrollbars
                        style={{
                            flex: 1,
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                    >
                        <textarea
                            style={{
                                fontSize: `${Math.round(this.state.fontSize * 10) / 10}em`
                            }}
                            className="input"
                            onChange={this.handleTextEdit.bind(this)}
                            value={this.state.selectedFileName ? this.state.files[this.state.selectedFileName].contents : ''}
                        ></textarea>
                    </Scrollbars>
                </div>
            </div>
        );
    }
}

export default App;
