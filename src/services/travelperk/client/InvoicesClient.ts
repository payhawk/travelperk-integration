import { IHttpClient } from '../http';
import { buildApiUrl, IInvoice, IInvoicesClient, IInvoicesFilter, IInvoicesResponse } from './contracts';

export class InvoicesClient implements IInvoicesClient {
    constructor(
        private readonly client: IHttpClient,
    ) { }

    async getInvoices(filter?: IInvoicesFilter): Promise<IInvoice[]> {
        const url = buildApiUrl('/invoices', filter);
        const result = await this.client.request<IInvoicesResponse>({ url, method: 'GET' });

        return result.invoices;
    }

    async getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer> {
        const url = buildApiUrl(`/invoices/${encodeURIComponent(serialNumber)}/pdf`);
        const result = await this.client.request({ url, method: 'GET', responseType: 'arraybuffer' });
        return result;
    }
}
