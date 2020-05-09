import CDRFile from './files/CDRFile.js';

const fs = require('fs');
const path = require('path');

zip.workerScriptsPath = "../lib/";

const options = {
    indexFilePath: './res/viewerIndex.json',
    maxResults: 500,
    envPaths: [
        // 'Z:\Corel',
        'E:\\Corelhintergruende'
    ]
}

let indexLock = false;
let indexCache = null;
let queed = false;

function getIndexFile() {
    if(!indexCache) {
        const indexPath = path.resolve(options.indexFilePath);
    
        if(!fs.existsSync(indexPath)) {
            fs.writeFileSync(indexPath, JSON.stringify({  }));
        }
    
        const indexFile = fs.readFileSync(indexPath, 'utf8');
        return JSON.parse(indexFile);
    } else {
        return indexCache;
    }
}

function updateIndex(file, metadata) {
    const indexPath = path.resolve(options.indexFilePath);
    const index = getIndexFile();

    if(file) {
        index[file] = metadata;
    }

    indexCache = index;

    if(indexLock) {
        queed = true;
        return;
    }

    indexLock = true;

    fs.writeFile(indexPath, JSON.stringify(indexCache, null, '  '), () => {
        indexLock = false;
        if(queed) {
            updateIndex();
        }
    });
}

function clearResults() {
    const resultsElement = document.querySelector('.result-list');
    // clear elements
    for(let child of resultsElement.children) {
        child.remove();
    }
}

function showResults(resultFiles) {
    const resultsElement = document.querySelector('.result-list');

    for(let file of resultFiles) {
        const resultElement = document.createElement('div');
        resultElement.className = "result-item";
        file.thumbnail.className = "thumbnail";
        resultElement.setAttribute('tag', file.filename.toLocaleLowerCase());
        resultElement.appendChild(file.thumbnail);
        resultsElement.appendChild(resultElement);
    }
}

function readFile(filePath, entry, callback) {
    if(entry.match('.cdr')) {
        const stream = fs.createReadStream(filePath);
        let fileData = [];

        stream.on('data', dataChunk => {
            fileData.push(dataChunk);
        });

        stream.on('close', () => {
            fileData = Buffer.concat(fileData);

            CDRFile.fromDataArray(fileData.buffer, filePath).then(cdr => {

                updateIndex(entry, { path: filePath, filename: entry, tag: "" });

                showResults([ cdr ]);
                callback();

            }).catch(err => {
                callback();
                console.error(err);
            });

            stream.destroy();
        });
    }
}

function scrapeDirectory(dirPath) {
    const dirEntries = fs.readdirSync(dirPath);

    let counter = 0;
    let totalFiles = options.maxResults;
    
    for(let entry of dirEntries) {
        if(counter > options.maxResults) break;

        const filePath = path.resolve(dirPath, entry);

        const x = readFile(filePath, entry, () => {
            totalFiles--;

            if(totalFiles == 0) {
                document.body.removeAttribute('loading');
            }
        });

        if(x) {
            counter++;
        }
    }
}

async function init() {

    clearResults();

    document.body.setAttribute('loading', '');

    for(let dirPath of options.envPaths) {
        scrapeDirectory(path.resolve(dirPath));
    }
}

const actions = {
    'openSettings': () => {
        document.body.removeAttribute('menu-open');
        console.log('menu');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    init();
});

window.addEventListener('click', e => {
    const clickAction = e.target.dataset.click;
    if(clickAction && actions[clickAction]) {
        actions[clickAction](e);
    }
});