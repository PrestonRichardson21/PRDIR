//Importing libraries
const fs = require('fs');
const {parseString, Builder} = require('xml2js');
const XLSX = require('xlsx');
// const { sdetConcat, agvanceConcat, compare } = require ('./Functions.js');
//Querying the XML input file


//Loading the XML file and concattinating the invoice number and the invoice total
let SalesInvoices = [];
let unconcatSalesInvoices = [];
let SalesInvoices2 = [];
let xml = fs.readFileSync('SDET076.137_006.xml').toString();
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
            SalesInvoices2.push(inv);

            // Concatenate InvoiceNumber and InvoiceTotal, then push as a single string
            SalesInvoices.push(SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceNumber + SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceTotal);
            // Push InvoiceNumber as a single string
            unconcatSalesInvoices.push(SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceNumber);
        }
    }

    return { unconcatSalesInvoices, SalesInvoices, SalesInvoices2 };
});


const flattenedSalesInvoices = SalesInvoices.flat();


//Loading the Agvance Data file and concattinating the control number and the ticket total
const workbook = XLSX.readFile('Agvancetickets.xls');
let AgvanceControlNumber = [];
const sheetNames = workbook.SheetNames;
const sheet = workbook.Sheets[sheetNames[0]]; // Assuming you want the first sheet
const data = XLSX.utils.sheet_to_json(sheet);


// turns an array of objects into an array of arrays
// for (let i = 0; i < data.length; i++) {
//         let inv = {
//             InvoiceNumber: [data[i].ControlNumber], // Wrap ControlNumber in an array
//             InvoiceTotal: [parseFloat(data[i].TicketTotal).toFixed(2)] // Wrap TicketTotal in an array
//         };
//         AgvanceControlNumber.push(inv);
//     }



// Turns an array of objects into an array of strings
for (let i = 0; i < data.length; i++){
        let inv = {};
        let tickTotal = parseFloat(data[i].TicketTotal).toFixed(2);
        // AgvanceControlNumber.push(data[i].ControlNumber + tickTotal);
        inv["ControlNumber"] = { value: data[i].ControlNumber};
        inv["TicketTotal"] = {value: tickTotal};
        AgvanceControlNumber.push(inv);

}

//Comparing the XML file with the agvance data file
const commonInvoices = flattenedSalesInvoices.filter(invoice =>
        AgvanceControlNumber.includes(invoice));



//Comparing the XML file with the agvance data file V2
// Step 2: Transform `data` Array

const matchedInvoice = SalesInvoices2.find(invoice => 
        AgvanceControlNumber.some(cn => cn.ControlNumber === invoice.InvoiceNumber.value)
    );



console.log(matchedInvoice);
console.log(AgvanceControlNumber.splice(150, 200));
console.log(SalesInvoices2.splice(150, 200));

// console.log(data.splice(150, 200));        
// console.log(SalesInvoices2.splice(0, 10));  
//Remove the duplicate entries

const regex = /<Invoice type="Charge"[\s\S]*?<InvoiceNumber>0023856097[\s\S]*?<\/Invoice>/gi;
xml = xml.replace(regex, '');

// Write the modified content back to the file
fs.writeFileSync('test.xml', xml, 'utf8');


if (SalesInvoices2.length > 0 && SalesInvoices2[0].InvoiceNumber) {
        console.log(SalesInvoices2[0].InvoiceNumber.value); // This should now work if the structure is correct
    } else {
        console.log("No invoices found or the first invoice does not have an InvoiceNumber.");
    }
