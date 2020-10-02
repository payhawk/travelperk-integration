import { ITokenSet } from '@store';

import { IInvoice } from './IInvoice';

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

/**
 * An interface for a TravelPerk auth client wrapper
 */
export interface IAuthClient {
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
}

/**
 * An interface for a TravelPerk invoices client wrapper
 */
export interface IInvoicesClient {
    /**
     * Retrieves all invoices
     */
    getInvoices(filter?: IInvoicesFilter): Promise<IInvoice[]>;

    /**
     * Gets invoice document
     * @param serialNumber Invoice serial number
     */
    getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer>;
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
