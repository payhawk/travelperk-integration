import { IInvoice } from './IInvoice';

/**
 * An interface for a TravelPerk invoices client wrapper
 */

export interface IInvoicesClient {
    /**
     * Retrieves all invoices
     */
    getInvoices(filter?: IGetInvoicesFilter): Promise<IInvoice[]>;

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
     * Pagination offset index, 0 based.
     */
    offset?: number;

    /**
     * Format is YYYY-MM-DD
     */
    issuing_date_gte?: string;

    /**
     * Format is YYYY-MM-DD
     */
    issuing_date_lte?: string;
}

export type IGetInvoicesFilter = Omit<IInvoicesFilter, 'limit' | 'offset'>;
