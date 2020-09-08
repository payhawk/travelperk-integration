import { Entities } from '@managers';

export interface IClient {
    /**
     * Uploads an invoice document
     * @param data Document data
     * @param amount Invoice total amount
     * @param currency Invoice paid currency
     * @param date Invoice date of issuing
     */
    uploadDocument(data: ArrayBuffer, amount: string, currency: Entities.Currency, date: string): Promise<void>;
}
