import React, { Component } from 'react';
import Dropbox from 'dropbox';
import Scrollbars from 'react-custom-scrollbars';
import config from '../config';
import utils from './utils';
import DBX from './dropbox';
import AutosaveText from './AutosaveText';
import DropboxButton from './DropboxButton';
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
            saving: false,
            files: [],
            fontSize: 1.1,
            accessToken,
            authUrl,
            selectedFileName: null,
            autosaveTimeoutId: null
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

    handleAutosave() {
        if (!this.state.accessToken) {
            return;
        }

        const files = this.state.files;
        const fileNames = Object.keys(files);
        const changedFiles = fileNames
            .map(name => this.state.files[name])
            .filter(file => file.changed);


        return Promise.all(changedFiles.map(file => this.dbx.saveFile(file.path_lower, file.contents)))
            .then((savedFiles) => {
                savedFiles.forEach((file) => {
                    file.changed = false;
                    files[file.name] = file;
                });


                this.setState({
                    files,
                    saving: false
                });
            });
    }

    handleNameEdit(e) {
        const name = e.target.value;

        if (name === this.state.selectedFileName) {
            return;
        }

        const files = this.state.files;
        const nameWithExt = `${name}.txt`;

        // create new file with this name
        const file = files[this.state.selectedFileName];
        files[nameWithExt] = this.dbx.getNewFile(nameWithExt, file.contents);

        this.setState({ selectedFileName: nameWithExt, files });
        this.setSelectedFile(nameWithExt);

        this.triggerAutosave();
    }

    handleTextEdit(e) {
        const files = this.state.files;
        const file = files[this.state.selectedFileName];
        file.contents = e.target.value;
        file.changed = true;
        this.setState({ files });


        this.triggerAutosave();
    }

    triggerAutosave() {
        if (this.state.autosaveTimeoutId) {
            clearTimeout(this.state.autosaveTimeoutId);
        }
        this.setState({
            autosaveTimeoutId: setTimeout(this.handleAutosave.bind(this), config.AUTOSAVE_TIMEOUT),
            saving: true
        });
    }

    setSelectedFile(name) {
        this.setState({
            selectedFileName: name
        });
        window.history.pushState(name, name, `/${name}`);
        document.title = name;
        this.fileNameInput.value = name.split('.')[0];
    }

    getFileNameInputRef(e) {
        if (e) {
            this.fileNameInput = e;
        }
    }

    render() {
        const fileNames = Object.keys(this.state.files);

        return (
            <div className="page">
                <div className="page-left">
                    <div className="logo">Inflow</div>
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
                        {!this.state.accessToken ? <DropboxButton authUrl={this.state.authUrl}/> :
                            <AutosaveText saving={this.state.saving} />}
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
