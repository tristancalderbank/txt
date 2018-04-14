const express = require('express');

const app = express();
const server = require('http').Server(app);
const config = require('../config');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');

app.set('views', 'public');
app.use(cookieParser());
app.use(bodyParser.text());
app.use(express.static('public'));

const dataDir = `${__dirname}/data`;
let files = [];

fs.readdirSync(dataDir).forEach((file) => {
    files.push(file.slice(0, -4));
});

console.log('loaded file list');
console.log(files);


app.post('/save/:name', (req, res) => {
    console.log(req.params.name);
    console.log(req.body);

    fs.writeFile(`${dataDir}/${req.params.name}.txt`, req.body, (err) => {
        if (err) {
            console.log(err);
            res.status(500);
            return;
        }

        fs.readdir(dataDir, (err, newFileList) => {
            if (err) {
                console.log(err);
                res.status(500);
                return;
            }

            files = newFileList.map(file => file.slice(0, -4));
            res.json(files);
            console.log('The file was saved!');
        });
    });
});

app.get('/files', (req, res) => {
    res.json(files);
});

app.get('/files/:name', (req, res) => {
    res.sendFile(`${dataDir}/${req.params.name}.txt`);
});

app.get(/.*/, (req, res) => {
    res.sendFile('index.html', {
        root: `${__dirname}/../public`
    });
});

server.listen(config.SERVER.PORT, () => {
    console.log(`listening on *:${config.SERVER.PORT}`);
});
