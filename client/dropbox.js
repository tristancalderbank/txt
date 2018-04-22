import utils from './utils';

class DBX {
    constructor(dbx) {
        this.dbx = dbx;
    }

    getNewFile(name, contents) {
        return {
            changed: true,
            name,
            contents,
            path_lower: `/${name}`
        };
    }

    getAllFiles() {
        return this.dbx.filesListFolder({ path: '' })
            .then((response) => {
                // TODO handle has_more flag
                const files = response.entries;
                const paths = files.map(x => x.path_lower);

                return Promise.all(paths.map(path => this.dbx.filesDownload({ path })
                    .then(data => utils.getBlobText(data.fileBlob))
                ))
                    .then((contents) => {
                        for (let i = 0; i < contents.length; i++) {
                            files[i].contents = contents[i];
                            files[i].changed = false;
                        }
                        return utils.arrayToMap(files, 'name');
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    saveFile(path, contents) {
        const mode = {};
        mode['.tag'] = 'overwrite';

        return this.dbx.filesUpload({
            path,
            contents,
            autorename: false,
            mute: true,
            mode
        });
    }
}

export default DBX;
