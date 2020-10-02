import { IAuthClient } from './IAuthClient';
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
