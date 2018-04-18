import React, { Component } from 'react';
import Scrollbars from 'react-custom-scrollbars';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            text: '',
            saving: false,
            saved: false,
            files: [],
            fontSize: 1.1
        };
    }

    componentDidMount() {
        document.onkeydown = this.handleKeyPress.bind(this);

        fetch('/files')
            .then(res => res.json())
            .then((files) => {
                this.setState({ files });

                if (document.location.pathname.length > 1) {
                    const file = document.location.pathname.slice(1);
                    this.fetchFile(`${decodeURIComponent(file)}`);
                }
            });
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
        return fetch(`/save/${this.state.name}`, {
            method: 'POST',
            body: this.state.text
        })
            .then(res => res.json())
            .then((files) => {
                this.setState({ saving: false, files, saved: true });
            });
    }

    setFileName(name) {
        document.title = name;
        this.setState({ name });
        window.history.pushState(name, name, `/${name}`);
    }

    handleNameEdit(e) {
        this.setFileName(e.target.value);
    }

    handleTextEdit(e) {
        const text = e.target.value;
        this.setState({ text, saved: false });
    }

    loadFile(name, content) {
        this.setFileName(name);
        this.setState({ text: content, saved: true });
    }

    fetchFile(file) {
        fetch(`/files/${file}`)
            .then(res => res.text())
            .then((res) => {
                this.loadFile(file, res);
            });
    }

    render() {
        return (
            <div className="page">
                <div className="page-left">
                    <div className="logo">.txt</div>
                    {this.state.files.map((file, i) => (
                        <div
                            key={i}
                            className="file"
                            onClick={this.fetchFile.bind(this, file)}
                        >
                            {file}
                        </div>
                    ))}
                </div>
                <div className="page-right">
                    <div className="toolbar">
                        <span className="name-text">name:</span>
                        <input
                            className="name"
                            onChange={this.handleNameEdit.bind(this)}
                            value={this.state.name}
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
                        autohide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                    >
                        <textarea
                            style={{
                                fontSize: `${Math.round(this.state.fontSize * 10) / 10}em`
                            }}
                            className="input"
                            onChange={this.handleTextEdit.bind(this)}
                            value={this.state.text}
                        ></textarea>
                    </Scrollbars>
                </div>
            </div>
        );
    }
}

export default App;
