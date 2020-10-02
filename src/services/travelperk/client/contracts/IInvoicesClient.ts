import { IInvoicesFilter } from './IClient';
import { IInvoice } from './IInvoice';

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
