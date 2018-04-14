import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            text: '',
            saving: false,
            saved: false,
            files: []
        };
    }

    componentDidMount() {
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
                    <textarea
                        className="input"
                        onChange={this.handleTextEdit.bind(this)}
                        value={this.state.text}
                    ></textarea>
                </div>
            </div>
        );
    }
}

export default App;
