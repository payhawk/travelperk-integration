import { IInvoice } from './IInvoice';

export interface IManager {
    getInvoices(): Promise<IInvoice[]>;
}
