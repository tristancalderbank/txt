import utils from './utils';

class DBX {
    constructor(dbx) {
        this.dbx = dbx;
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
                        }
                        return utils.arrayToMap(files, 'name');
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

export default DBX;
