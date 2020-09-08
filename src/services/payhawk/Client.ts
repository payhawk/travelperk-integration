import Axios from 'axios';

import { config } from '@config';
import { Entities } from '@managers';

import { IClient } from './IClient';

export class Client implements IClient {
    // @ts-ignore
    private readonly headers: { [key: string]: string };

    // @ts-ignore
    constructor(private readonly accountId: string, apiKey: string) {
        this.headers = {
            'X-Payhawk-ApiKey': apiKey,
        };
    }

    async uploadDocument(data: ArrayBuffer, amount: string, currency: Entities.Currency, date: string): Promise<void> {
        await Axios.post(
            `${config.payhawkUrl}/api/v2/accounts/${encodeURIComponent(this.accountId)}/invoices`,
            data,
            {
                headers: {
                    ...this.headers,
                    'X-Payhawk-Invoice-Merchant': 'TravelPerk',
                    'X-Payhawk-Invoice-Total-Amount': amount,
                    'X-Payhawk-Invoice-Currency': currency,
                    'X-Payhawk-Invoice-Paid-At': date,
                },
            }
        );
    }
}
