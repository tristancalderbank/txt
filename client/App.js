import React, { Component } from 'react';
import Dropbox from 'dropbox';
import Scrollbars from 'react-custom-scrollbars';
import config from '../config';
import utils from './utils';
import DBX from './dropbox';
import AutosaveText from './AutosaveText';
import DropboxButton from './DropboxButton';
import _ from 'lodash';
import Cookies from 'js-cookie';

class App extends Component {
    constructor(props) {
        super(props);

        const accessToken = utils.getAccessTokenFromUrl() || Cookies.get('accessToken');
        Cookies.set('accessToken', accessToken);

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
            autosaveTimeoutId: null,
            zenMode: false,
            themes: {
                default: {
                    colorPrimary: '#3076f8',
                    colorTextMajor: 'black',
                    colorTextMinor: 'rgba(3,27,78,.6)',
                    colorBackground: 'white'
                },
                dark: {
                    colorPrimary: '#7289da',
                    colorTextMajor: 'hsla(0,0%,100%,.7)',
                    colorTextMinor: '#dcddde',
                    colorBackground: 'hsl(218, 7%, 23%)'
                }
            }
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
        // ESC
        if (event.keyCode === 27) {
            this.setState({
                zenMode: !this.state.zenMode
            });
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
        const nameWithExt = `${name}.txt`;

        if (nameWithExt === this.state.selectedFileName) {
            return;
        }

        const files = this.state.files;

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
        const files = Object.keys(this.state.files).reduce((acc, name) => {
            acc.push(this.state.files[name]);
            return acc;
        }, []);

        const sortedFiles = files.sort(utils.sortByAlph.bind(this, 'client_modified')).reverse();

        const theme = this.state.themes.dark;

        return (
            <div style={{ color: theme.colorTextMajor, background: theme.colorBackground }} className="page">
                {this.state.zenMode ? null : <div className="page-left" style={{ color: theme.colorTextMinor }}>
                    {/* <div className="logo" style={{ color: theme.colorPrimary }}>Inflow</div> */}
                    {sortedFiles.map((file, i) => (
                        <div
                            key={i}
                            className="file"
                            onClick={this.setSelectedFile.bind(this, file.name)}
                        >
                            {file.name.split('.')[0]}
                        </div>
                    ))}
                </div>}
                <div className="page-right">
                    {this.state.zenMode ? null : <div className="toolbar" style={{ color: theme.colorPrimary }}>
                        <input
                            className="name"
                            onBlur={this.handleNameEdit.bind(this)}
                            ref={this.getFileNameInputRef.bind(this)}
                        ></input>
                        {!this.state.accessToken ? <DropboxButton authUrl={this.state.authUrl}/> :
                            <AutosaveText saving={this.state.saving} />}
                    </div>}
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
