//Importing libraries
const fs = require('fs');
const {parseString, Builder} = require('xml2js');

//Loading the XML file
const xml = fs.readFileSync('SDET.xml').toString();
parseString(xml, function(err, SDET) {

        if (err) {
                console.error("Error parsing XML:", err);
                return;
            }
          
       for (let i = 0; i < SDET.SalesTransactions.LocationSalesDetail.length; i++){
        for (let j = 0; j < SDET.SalesTransactions.LocationSalesDetail[i].Invoice.length; j++){
        console.log(SDET.SalesTransactions.LocationSalesDetail[i].Invoice[j].InvoiceNumber);
       }
}
});

