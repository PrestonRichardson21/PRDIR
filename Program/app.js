//Importing libraries
const fs = require('fs');
const {parseString, Builder} = require('xml2js');
const XLSX = require('xlsx');
// const { sdetConcat, agvanceConcat, compare } = require ('./Functions.js');
//Querying the XML input file


//Loading the XML file and concattinating the invoice number and the invoice total
let SalesInvoices = [];
const xml = fs.readFileSync('SDET076.137_006.xml').toString();
parseString(xml, function(err, SDET) {

        if (err) {
                console.error("Error parsing XML:", err);
                return;
            }
       for (let i = 0; i < SDET.SalesTransactions.LocationSalesDetail.length; i++){
        for (let j = 0; j < SDET.SalesTransactions.LocationSalesDetail[i].Invoice.length; j++){
        SalesInvoices.push(SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceNumber + SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceTotal);
       }
}


return SalesInvoices;

}

);
const flattenedSalesInvoices = SalesInvoices.flat();
//console.log(flattenedSalesInvoices.slice(200,301));

//Loading the Agvance Data file and concattinating the control number and the ticket total
const workbook = XLSX.readFile('Agvancetickets-100.xls');
let AgvanceControlNumber = [];
const sheetNames = workbook.SheetNames;
const sheet = workbook.Sheets[sheetNames[0]]; // Assuming you want the first sheet
const data = XLSX.utils.sheet_to_json(sheet);
// console.log(data);
for (let i = 0; i < data.length; i++){
        let tickTotal = parseFloat(data[i].TicketTotal).toFixed(2);
        AgvanceControlNumber.push(data[i].ControlNumber + tickTotal);
}
console.log(AgvanceControlNumber.slice(200,301));
//Comparing the XML file with the agvance data file
const commonInvoices = flattenedSalesInvoices.filter(invoice =>
        AgvanceControlNumber.includes(invoice));

console.log(commonInvoices.length);

//Remove the duplicate entries



