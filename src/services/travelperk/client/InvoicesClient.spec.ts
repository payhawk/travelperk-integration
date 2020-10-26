import { Mock } from 'typemoq';

import { IHttpClient } from '../http';
import { IGetInvoicesFilter, InvoiceStatus } from './contracts';
import { InvoicesClient } from './InvoicesClient';

describe('TravelPerk invoices client tests', () => {
    const httpMock = Mock.ofType<IHttpClient>();

    const client = new InvoicesClient(httpMock.object);

    it('should get all invoices', async () => {
        const filter: IGetInvoicesFilter = {
            status: InvoiceStatus.Paid,
            issuing_date_gte: '2020-09-30',
        };

        httpMock
            .setup(x => x.request({
                url: `https://api.travelperk.com/invoices?limit=50&offset=0&status=${filter.status}&issuing_date_gte=${encodeURIComponent(filter.issuing_date_gte!)}`,
                method: 'GET',
            }))
            .returns(async () => ({ total: 52, invoices: new Array(50).fill({}) }));

        httpMock
            .setup(x => x.request({
                url: `https://api.travelperk.com/invoices?limit=50&offset=50&status=${filter.status}&issuing_date_gte=${encodeURIComponent(filter.issuing_date_gte!)}`,
                method: 'GET',
            }))
            .returns(async () => ({ total: 52, invoices: new Array(2).fill({}) }));

        const result = await client.getInvoices(filter);
        expect(result).toHaveLength(52);
    });

    it('should get invoice line items', async () => {
        const serialNumber = '0001';

        httpMock
            .setup(x => x.request({
                url: `https://api.travelperk.com/invoices/lines?limit=50&offset=0&serial_number=${serialNumber}`,
                method: 'GET',
            }))
            .returns(async () => ({ total: 2, invoice_lines: new Array(2).fill({}) }));

        const result = await client.getInvoiceLineItems(serialNumber);
        expect(result).toHaveLength(2);
    });

    it('should get invoice document', async () => {
        const serialNumber = '0001';

        httpMock
            .setup(x => x.request({
                url: `https://api.travelperk.com/invoices/${serialNumber}/pdf`,
                method: 'GET',
                responseType: 'arraybuffer',
            }))
            .returns(async () => new ArrayBuffer(0));

        await client.getInvoiceLineItems(serialNumber);
    });
});
