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
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: fileStorageEngine });

app.post('/single', upload.single('image'), (req, res) => {
    console.log(req.file);
    res.send('File uploaded');
});

app.use(express.static('Program'));

const data = fs.readFileSync('SDET.xml', 'utf8');
    xml2js.parseString(data, (err, result) => {
    if (err) {
        throw err;
    }  
    //   console.log(result);
});
    app.get("/", (req, res) => {    
        res.sendFile(path.join(__dirname, 'index.html'));
    });

const server = http.createServer((req, res) => {
    const pathname = req.url;
    const method = req.method;

    if (pathname === '/' && method === 'GET') {

    //     fs.readFile('index.html', 'utf8', (err, data) => {
    //         if (err) {
    //             res.writeHead(500, {'Content-Type': 'text/html'});
    //             res.end('<h1>Error loading the page</h1>');
    //         } else {           
    //             res.writeHead(200, {'Content-Type': 'text/html'});
    //             res.end(data);
    //        }
    //      }
    // );
    } else if (pathname === '/' && method === 'POST') {
        run();
    } else if (pathname === '/example' && method === 'POST') {
        // Do something else
        res.writeHead(404, {
            'Content-type': 'text/html',
        });
        res.end('<h1>Example ran</h1>');
    } else {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.end('<h1>Page not found</h1>');
    }
});

app.post('/', (req, res) => {
    run(); // Call the run function
    res.send("run() function was called");
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });





