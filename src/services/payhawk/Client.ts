import Axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';

import { config } from '@config';

import { IClient, IDocument } from './IClient';

export class Client implements IClient {
    private readonly http: AxiosInstance;

    constructor(private readonly accountId: string, apiKey: string) {
        this.http = Axios.create({
            headers: {
                'X-Payhawk-ApiKey': apiKey,
            },
        });
    }

    async uploadDocument({ id, name, content, contentType, paidDate, documentDate, documentNumber, currency, totalAmount, taxAmount }: IDocument): Promise<void> {
        const formData = new FormData();
        formData.append('file', content, { filename: name, contentType });

        await this.http.post(
            `${config.payhawkUrl}/api/v2/accounts/${encodeURIComponent(this.accountId)}/invoices`,
            formData,
            {
                headers: {
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Id`]: id,
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Provider`]: 'travelperk',
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Supplier-Name`]: 'TravelPerk, S.L.',
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Supplier-VAT`]: 'ESB66484577',
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Supplier-Country`]: 'ES',
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Paid-At`]: paidDate,
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Total-Amount`]: totalAmount,
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Tax-Amount`]: taxAmount,
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Currency`]: currency,
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Date`]: documentDate,
                    [`${PAYHAWK_INVOICE_HEADER_PREFIX}-Number`]: documentNumber,
                    ...formData.getHeaders(),
                },
            }
        );
    }
}

const PAYHAWK_INVOICE_HEADER_PREFIX = 'X-Payhawk-Invoice';
