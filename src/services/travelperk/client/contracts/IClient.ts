import { ITokenSet } from '@store';

import { IAuthClient } from './IAuthClient';
import { IInvoice } from './IInvoice';
import { IInvoicesClient } from './IInvoicesClient';

/**
 * An interface for a TravelPerk client wrapper that enables making TravelPerk API calls
 */
export interface IClient {
    /**
     * Auth client wrapper for connecting, disconnecting and managing access tokens
     */
    auth: IAuthClient;

    /**
     * Invoices client wrapper for retrieving invoices, invoice lines and invoice documents
     */
    invoices: IInvoicesClient;
}

export interface IInvoicesFilter extends Pick<Partial<IInvoice>, 'status'> {
    /**
     * Page size - between 10 and 50 inclusive
     */
    limit?: number;

    /**
     * Format is YYYY-MM-DD
     */
    issuing_date_gte?: string;

    /**
     * Format is YYYY-MM-DD
     */
    issuing_date_lte?: string;
}

export interface IAccessToken extends Required<ITokenSet> {
    expired(): boolean;
}
