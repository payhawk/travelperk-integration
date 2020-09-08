import { ITokenSet } from '@store';

import { IInvoice } from './IInvoice';

/**
 * An interface for a TravelPerk client wrapper that enables making TravelPerk API calls
 */
export interface IClient {
    /**
     * Builds URL for user login and consent, and returns it
     */
    buildConsentUrl(): string;

    /**
     * Exchanges temporary auth code with access token / refresh token pair
     * @param code Authorization code
     */
    getAccessToken(code: string): Promise<IAccessToken>;

    /**
     * Uses current refresh token to exchange expired access token new with access token / refresh token pair
     * @param currentToken Token set that will be used to obtain a refreshed token
     */
    refreshAccessToken(currentToken: IAccessToken): Promise<IAccessToken>;

    /**
     * Retrieves all invoices
     */
    getInvoices(filter?: IInvoicesFilter): Promise<IInvoice[]>;
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
