import { IInvoice } from './IInvoice';

export interface IManager {
    getPaidInvoicesSinceLastSync(): Promise<IInvoice[]>;
    getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer>;
}
