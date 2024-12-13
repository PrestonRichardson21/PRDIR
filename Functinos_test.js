const assert = require('assert');
// const { run, compare, excelLoad, sdetLoad } = require ('./Functions.js');
const {run} = require ('./Functions.js');
describe('compare', () => {
    it('should return an array of duplicate entries', () => {
        const expectedResults = [
            { InvoiceNumber: '1234', InvoiceTotal: '100.00', ControlNumber: '1234', TicketTotal: '100.00' },
            { InvoiceNumber: '1234', InvoiceTotal: '100.00', ControlNumber: '1234', TicketTotal: '100.00' }
        ];
        let salesInv = [
            { InvoiceNumber: '1234', InvoiceTotal: '100.00' },
            { InvoiceNumber: '1234', InvoiceTotal: '100.00' }
        ];
        let agvanceData = [
            { ControlNumber: '1234', TicketTotal: '100.00' },
            { ControlNumber: '1234', TicketTotal: '100.00' }
        ];
        const actualResults = compare();
        assert.deepStrictEqual(actualResults, expectedResults);
    });
});

// need to break up the run program into smaller functions so i can test compare and fix the duplicate list expected results.
