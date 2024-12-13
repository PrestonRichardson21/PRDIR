const http = require('http');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const xml2js = require('xml2js');
const path = require('path');
const app = express();
const hostname = '127.0.0.1';
const port = 3000;
const { run } = require ('./Functions.js');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './dataFiles');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: fileStorageEngine });
const multipleUpload = upload.fields([
    { name: 'xmlFile', maxCount: 1 },
    { name: 'excelFile', maxCount: 1 }
]);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/upload', multipleUpload, (req, res) => {
    const salesFile = req.files['xmlFile'][0];
    const excelFile = req.files['excelFile'][0];

    // Process the files as needed
    console.log(`Sales File: ${salesFile.path}`);
    console.log(`Excel File: ${excelFile.path}`);

    // Call your function to process the files
    run(salesFile.path, excelFile.path);

    // Provide a link to download the test.xml file
    res.send(`
        <h1>Files uploaded and processed successfully</h1>
        <a href="/download/test.xml" download>Download test.xml</a>
    `);
});
app.get('/download/test.xml', (req, res) => {
    const file = path.join(__dirname, 'test.xml');
    res.download(file);
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});




