import { IInvoice, IInvoiceLine } from './IInvoice';

export interface IManager {
    getLastInvoicesSync(): Promise<Date | undefined>;
    updateLastInvoicesSync(syncedAt: Date): Promise<void>;

    getPaidInvoices(after: Date | undefined): Promise<IInvoice[]>;
    getInvoiceLines(serialNumber: string): Promise<IInvoiceLine[]>;
    getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer>;
}
