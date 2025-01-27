// Import dependencies
const fs = require("fs");
const { parseString, Builder } = require("xml2js");

// Load the XML
const xml = fs.readFileSync("data.xml").toString();
parseString(xml, function (err, data) {

    // Show the XML
    console.dir(data.people.person.length);

    // Modify the XML to change the first ID to a 2
    data.people.person[0].$.id = 2;

    // Saved the XML by writing over the file
    const builder = new Builder();
    const xml = builder.buildObject(data);
    fs.writeFileSync("data.xml", xml, function (err, file) {
        if (err) throw err;
        console.log("Saved!");
    });

});