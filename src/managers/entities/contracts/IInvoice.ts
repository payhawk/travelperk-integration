export interface IInvoice {
    serialNumber: string;
    status: InvoiceStatus;
    profileId: string;
    profileName: string;
    issuingDate: string;
    dueDate: string;
    currency: Currency;
    total: string;
    pdf: string;
}

export enum Currency {
    BGN = 'BGN',
    EUR = 'EUR',
    GBP = 'GBP',
    USD = 'USD',
}

export enum InvoiceStatus {
    Draft = 'draft',
    Open = 'open',
    Paid = 'paid',
    Unpaid = 'unpaid',
}
