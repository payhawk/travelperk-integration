import { IInvoice } from './IInvoice';

export interface IManager {
    getLastInvoicesSync(): Promise<Date | undefined>;
    updateLastInvoicesSync(syncedAt: Date): Promise<void>;

    getPaidInvoices(after: Date | undefined): Promise<IInvoice[]>;
    getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer>;
}
