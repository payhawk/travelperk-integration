import { IHttpClient } from '../http';
import { buildApiUrl, IGetInvoicesFilter, IInvoice, IInvoiceLine, IInvoiceLinesFilter, IInvoiceLinesResponse, IInvoicesClient, IInvoicesFilter, IInvoicesResponse } from './contracts';

export class InvoicesClient implements IInvoicesClient {
    constructor(
        private readonly client: IHttpClient,
    ) { }

    async getInvoices(filter?: IGetInvoicesFilter): Promise<IInvoice[]> {
        let result: IInvoice[] = [];
        let page = 0;
        let pageResult: IInvoicesResponse;

        do {
            const filterQuery: IInvoicesFilter = {
                limit: DEFAULT_PAGINATION_LIMIT,
                offset: page * DEFAULT_PAGINATION_LIMIT,
                ...(filter || {}),
            };

            const url = buildApiUrl('/invoices', filterQuery);
            pageResult = await this.client.request<IInvoicesResponse>({ url, method: 'GET' });

            result = result.concat(pageResult.invoices);

            page++;
        } while (pageResult.total > result.length);

        return result;
    }

    async getInvoiceLineItems(serialNumber: string): Promise<IInvoiceLine[]> {
        const queryFilter: IInvoiceLinesFilter = {
            limit: DEFAULT_PAGINATION_LIMIT,
            offset: 0,
            serial_number: serialNumber,
        };

        const url = buildApiUrl('/invoices/lines', queryFilter);
        const result = await this.client.request<IInvoiceLinesResponse>({ url, method: 'GET'});
        return result.invoice_lines;
    }

    async getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer> {
        const url = buildApiUrl(`/invoices/${encodeURIComponent(serialNumber)}/pdf`);
        const result = await this.client.request({ url, method: 'GET', responseType: 'arraybuffer' });
        return result;
    }
}

const DEFAULT_PAGINATION_LIMIT = 50;
