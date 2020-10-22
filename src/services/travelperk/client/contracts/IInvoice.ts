export interface IInvoice {
    taxes_summary: ITaxesSummaryItem[];
    serial_number: string,
    status: InvoiceStatus;
    profile_id: string,
    profile_name: string,
    issuing_date: string,
    due_date: string,
    currency: Currency,
    total: string,
    pdf: string;
    lines: IInvoiceLineItem[];
}

export interface IInvoiceLineItem {
    expense_date: string;
    description: string;
    tax_percentage: string;
    tax_amount: string;
    total_amount: string;
}

export interface ITaxesSummaryItem {
    tax_amount: string;
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
