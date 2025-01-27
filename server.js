const http = require('http');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const xml2js = require('xml2js');
const path = require('path');
const app = express();
const hostname = '127.0.0.1';
const port = 3000;
let { run} = require ('./Functions.js');


const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './dataFiles');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const clearDataFiles = () => {
    const directory = './dataFiles';
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
};

const upload = multer({ storage: fileStorageEngine });
const multipleUpload = upload.fields([
    { name: 'xmlFile', maxCount: 1 },
    { name: 'excelFile', maxCount: 1 }
]);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/upload', multipleUpload, (req, res) => {
    const salesFile = req.files['xmlFile'] ? req.files['xmlFile'][0] : null;
    const excelFile = req.files['excelFile'] ? req.files['excelFile'][0] : null;
        // Check if either file is missing
        if (!salesFile || !excelFile) {
            return res.send(`
                <link rel="stylesheet" type="text/css" href="/style.css">
                <h1>Upload Failed</h1>
                <p>Both XML and Excel files are required.</p>
                <button onclick="window.location.href='/'">Go Back to Home</button>
            `);
        }

    // Call your function to process the files
    const {duplicates, duplicateInvoiceNumbers} = run(salesFile.path, excelFile.path);
        clearDataFiles();

    // Provide a link to download the updated.xml file
    res.send(`
        <link rel="stylesheet" type="text/css" href="/style.css">
        <div>
            <button onclick="window.location.href='/'">Go Back to Home</button>
            <a href="/download/updated.xml" download>Download updated.xml</a>
        </div>
        <h1>Files uploaded and processed successfully</h1>
        <h2># of Duplicates Removed:</h2>
        <h3> ${duplicates.length} </h3>
        <h2># of invoice numbers changed:</h2>
        <h3> ${duplicateInvoiceNumbers.length}</h3>
        <h2>Removed Duplicates</h2>
        <ul class="grid">
            ${duplicates.map(duplicates => `<li>${duplicates}</li>`).join('')}
        </ul>
        <h2>Changed Invoice Numbers</h2>
        <ul class="grid">
            ${duplicateInvoiceNumbers.map(invoiceNumber => `<li>${invoiceNumber}</li>`).join('')}
        </ul>

    `);
});

app.get('/download/updated.xml', (req, res) => {
    const file = path.join(__dirname, 'updated.xml');
    res.download(file);
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});




