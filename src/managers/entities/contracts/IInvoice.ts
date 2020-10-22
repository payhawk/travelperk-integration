export interface IInvoice {
    serialNumber: string;
    status: InvoiceStatus;
    profileId: string;
    profileName: string;
    issuingDate: string;
    dueDate: string;
    currency: Currency;
    total: number;
    taxesSummary: ITaxesSummaryItem[];
}

export interface IInvoiceLine {
    expenseDate: string;
    description: string;
    taxPercentage: string;
    taxAmount: string;
    totalAmount: string;
}

export interface ITaxesSummaryItem {
    taxAmount: number;
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
