import { Entities } from '@managers';

export interface IClient {
    /**
     * Uploads an invoice document
     * @param document Document data
     */
    uploadDocument(document: IDocument): Promise<void>;
}

export interface IDocument {
    id: string;
    name: string;
    content: ArrayBuffer;
    contentType: string;
    paidDate: string;
    currency: Entities.Currency;
    totalAmount: number;
    taxAmount: number;
    documentDate: string;
    documentNumber: string;
}
