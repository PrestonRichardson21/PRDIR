const fs = require('fs');
const {parseString, Builder} = require('xml2js');
const XLSX = require('xlsx');
let salesInv = [];
let xml = fs.readFileSync('SDET.xml').toString();
let agvanceData = [];
let duplicates = [];
let sdetLoad = () => {
    //Querying the XML input file


parseString(xml, function(err, SDET) {
    if (err) {
        console.error("Error parsing XML:", err);
        return;
    }
    for (let i = 0; i < SDET.SalesTransactions.LocationSalesDetail.length; i++) {
        for (let j = 0; j < SDET.SalesTransactions.LocationSalesDetail[i].Invoice.length; j++) {
            let inv = {};
            // Wrap the InvoiceNumber and InvoiceTotal in objects with a single string element
            inv["InvoiceNumber"] = { value: SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceNumber.toString() };
            inv["InvoiceTotal"] = { value: SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceTotal.toString() };
            salesInv.push(inv);
        }
    }
    return salesInv;
});
};

let excelLoad = () => {
//Loading the Agvance Data file 
const workbook = XLSX.readFile('AgvanceTickets4PR.xlsx');

const sheetNames = workbook.SheetNames;
const sheet = workbook.Sheets[sheetNames[0]]; // Assuming you want the first sheet
const data = XLSX.utils.sheet_to_json(sheet);

// Turns an array of objects into an array of strings
for (let i = 0; i < data.length; i++){
    let inv = {};
    let tickTotal = parseFloat(data[i].TicketTotal).toFixed(2);
    // agvanceData.push(data[i].ControlNumber + tickTotal);
    inv["ControlNumber"] = { value: data[i].ControlNumber};
    inv["TicketTotal"] = {value: tickTotal};
    agvanceData.push(inv);
};
};

let compare = () =>{
//Creates a list of duplicate entries that has the same invoice number and ticket total

for(let i = 0; i < salesInv.length; i++){
    if (agvanceData.some(inv => inv.ControlNumber.value === salesInv[i].InvoiceNumber.value )&& agvanceData.some(inv => inv.TicketTotal.value === salesInv[i].InvoiceTotal.value)){
            duplicates.push(salesInv[i].InvoiceNumber.value);
        } else {
        //  console.log("No invoices found or the first invoice does not have an InvoiceNumber.");
        }
    };

    // Remove all duplicates from the original string after processing them
    for(let i = 0; i < duplicates.length; i++){
        const regex = new RegExp(`<InvoiceNumber>${duplicates[i]}[\\s\\S]*?<\\/Invoice>`, 'gi');
        if(xml.match())
        xml = xml.replace(regex, '');
    };
    for(let i = 0; i < duplicates.length; i++){

        xml = xml.replace(/<Invoice type="CHARGE">[\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s]/, '');
    };
console.log(duplicates);
//  Write the modified content back to the file
fs.writeFileSync('test.xml', xml, 'utf8');
};
let run = () =>{
    console.log('Hello World');
    sdetLoad(); 
    excelLoad();
    compare();
};
module.exports = { run };