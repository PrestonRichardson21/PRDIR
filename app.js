const { run } = require('./Functions.js');

let runApp = () => {
    console.log('Hello World');

    // Provide the correct paths to the XML and Excel files
    // const salesFilePath = './dataFiles/SDET.xml';
    // const excelFilePath = './dataFiles/Agvance.xlsx';

    run(salesFilePath, excelFilePath);
};

runApp();

