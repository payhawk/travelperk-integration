import { IHttpClient } from '../http';
import { buildApiUrl, IGetInvoicesFilter, IInvoice, IInvoicesClient, IInvoicesFilter, IInvoicesResponse } from './contracts';

export class InvoicesClient implements IInvoicesClient {
    constructor(
        private readonly client: IHttpClient,
    ) { }

    async getInvoices(filter?: IGetInvoicesFilter): Promise<IInvoice[]> {
        let result: IInvoice[] = [];

        let page = 0;

        const filterQuery: IInvoicesFilter = {
            limit: DEFAULT_INVOICES_LIMIT,
            offset: page * DEFAULT_INVOICES_LIMIT,
            ...(filter || {}),
        };

        let url = buildApiUrl('/invoices', filterQuery);
        let pageResult = await this.client.request<IInvoicesResponse>({ url, method: 'GET' });

        result = result.concat(pageResult.invoices);

        while (pageResult.total > result.length) {
            page++;

            filterQuery.offset = page * DEFAULT_INVOICES_LIMIT;

            url = buildApiUrl('/invoices', filterQuery);
            pageResult = await this.client.request<IInvoicesResponse>({ url, method: 'GET' });
        }

        return result;
    }

    async getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer> {
        const url = buildApiUrl(`/invoices/${encodeURIComponent(serialNumber)}/pdf`);
        const result = await this.client.request({ url, method: 'GET', responseType: 'arraybuffer' });
        return result;
    }
}

const DEFAULT_INVOICES_LIMIT = 50;
