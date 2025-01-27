const fs = require('fs');
const { parseString, Builder } = require('xml2js');
const XLSX = require('xlsx');

// Function to remove the first digit from an invoice number
function removeFirstDigit(invoiceNumber) {
    return invoiceNumber.substring(1);
}

let sdetLoad = (salesFilePath) => {
    // Querying the XML input file
    const xml = fs.readFileSync(salesFilePath).toString();
    const salesInv = [];

    // const xml = fs.readFileSync(salesFilePath).toString();
    parseString(xml, function (err, SDET) {
        if (err) {
            console.error("Error parsing XML:", err);
            return;
        }
        // Check if SDET.SalesTransactions and LocationSalesDetail exist
        if (SDET.SalesTransactions && SDET.SalesTransactions.LocationSalesDetail) {
            for (let i = 0; i < SDET.SalesTransactions.LocationSalesDetail.length; i++) {
                if (SDET.SalesTransactions.LocationSalesDetail[i].Invoice) { // Check if Invoice exists
                    for (let j = 0; j < SDET.SalesTransactions.LocationSalesDetail[i].Invoice.length; j++) {
                        let inv = {};
                        inv["InvoiceNumber"] = { value: SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceNumber.toString() };
                        inv["InvoiceTotal"] = { value: SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceTotal.toString() };
                        salesInv.push(inv);
                    }
                }
            }
        } else {
            console.error("Expected XML structure not found.");
        }
    });

    return {xml, salesInv};
};


let excelLoad = (excelFilePath) => {
    const agvanceData = [];

    //Loading the Agvance Data file 
    const workbook = XLSX.readFile(excelFilePath);
    // const workbook = XLSX.readFile(excelFilePath);
    const sheetNames = workbook.SheetNames;
    const sheet = workbook.Sheets[sheetNames[0]]; // Assuming you want the first sheet
    const data = XLSX.utils.sheet_to_json(sheet);
  
    // Turns an array of objects into an array of strings
    for (let i = 0; i < data.length; i++) {
        const inv = {};
        const tickTotal = parseFloat(data[i].TicketTotal).toFixed(2);
        // agvanceData.push(data[i].ControlNumber + tickTotal);
        inv["ControlNumber"] = { value: data[i].ControlNumber };
        inv["TicketTotal"] = { value: tickTotal };
        agvanceData.push(inv);
    };

    return agvanceData;

};

let compare = (xml, salesInv, agvanceData) => {
    //Creates a list of duplicate entries that has the same invoice number and ticket total
    const duplicates = [];
    const duplicateInvoiceNumbers = [];
    let invoiceCount = {};
    
    for (let i = 0; i < salesInv.length; i++) {
        let invoiceNumber = salesInv[i].InvoiceNumber.value;
        invoiceCount[invoiceNumber] = (invoiceCount[invoiceNumber] || 0) + 1;

        if (agvanceData.some(inv => inv.ControlNumber.value === salesInv[i].InvoiceNumber.value) && agvanceData.some(inv => inv.TicketTotal.value === salesInv[i].InvoiceTotal.value)) {
            duplicates.push(salesInv[i].InvoiceNumber.value);
            // console.log(`${salesInv[i].InvoiceNumber.value} is a duplicate`);
        } else if (agvanceData.some(inv => inv.ControlNumber.value === salesInv[i].InvoiceNumber.value) && !agvanceData.some(inv => inv.TicketTotal.value === salesInv[i].InvoiceTotal.value)) {
            duplicateInvoiceNumbers.push(salesInv[i].InvoiceNumber.value);
            
            //  console.log(`${salesInv[i].InvoiceNumber.value} has a different Ticket Total`);
        } else if (invoiceCount[invoiceNumber] > 1 ) {
            duplicateInvoiceNumbers.push(invoiceNumber);
            console.log(`${invoiceNumber} has a different Ticket Total`);

        }
      
    };

    // Remove all duplicates from the original string after processing them
    for (let i = 0; i < duplicates.length; i++) {
        const regex = new RegExp(`<InvoiceNumber>${duplicates[i]}[\\s\\S]*?<\\/Invoice>`, 'gi');
        if (xml.match())
            xml = xml.replace(regex, '');
    };
    for (let i = 0; i < duplicates.length; i++) {

        xml = xml.replace(/<Invoice type="CHARGE">[\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s][\s]/, '');
    };


    // change the duplicate invoice number to a different invoice number

    const duplicateCount = {};

    for (let i = 0; i < duplicateInvoiceNumbers.length; i++) {
        const originalInvoiceNumber = duplicateInvoiceNumbers[i];
        firstDigitOfInvoiceNumber = Number(String(originalInvoiceNumber).charAt(0));

        if (!duplicateCount[originalInvoiceNumber]) {
            duplicateCount[originalInvoiceNumber] = 0;
        }

  
        let prefix = 9 - duplicateCount[originalInvoiceNumber];
  
        //making sure the prefix is not the same as the first digit of the invoice number because then the invoice number will be the same
        if (prefix === firstDigitOfInvoiceNumber && prefix < 9) {
            prefix++;
        }else{
            prefix--;
        }

    

        [originalInvoiceNumber];
        duplicateCount[originalInvoiceNumber]++;

        let changedInvoiceNumber = prefix + removeFirstDigit(originalInvoiceNumber);
        console.log(`Changed Invoice Number: ${changedInvoiceNumber}`);
        const regex = new RegExp(`<InvoiceNumber>${originalInvoiceNumber}[\\s\\S]*?<\\/InvoiceNumber>`, 'i');
        xml = xml.replace(regex, `<InvoiceNumber>${changedInvoiceNumber}</InvoiceNumber>`);
        
    }

   

    //  Write the modified content back to the file
    fs.writeFileSync('updated.xml', xml, 'utf8');
    return { duplicates, duplicateInvoiceNumbers};
};


let run = (salesFilePath, excelFilePath) => {
    const {xml, salesInv} = sdetLoad(salesFilePath);
    const agvanceData = excelLoad(excelFilePath);
    const {duplicates, duplicateInvoiceNumbers} = compare(xml, salesInv, agvanceData);
    return {duplicates, duplicateInvoiceNumbers};
};

module.exports = { run };
