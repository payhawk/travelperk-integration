export interface IInvoice {
    serial_number: string,
    status: InvoiceStatus;
    profile_id: string,
    profile_name: string,
    issuing_date: string,
    due_date: string,
    currency: Currency,
    total: string,
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

export interface IInvoicesResponse {
    total: number;
    limit: number;
    offset: number;
    invoices: IInvoice[];
}
