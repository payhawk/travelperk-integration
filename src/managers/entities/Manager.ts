import { TravelPerk } from '@services';
import { IStore } from '@store';
import { ILogger, toShortDateFormat } from '@utils';

import { IInvoice, IInvoiceLine, IManager, ITaxesSummaryItem } from './contracts';

export class Manager implements IManager {
    constructor(
        private readonly client: TravelPerk.IClient,
        private readonly store: IStore,
        private readonly accountId: string,
        // @ts-ignore
        private readonly logger: ILogger,
    ) { }

    async getLastInvoicesSync(): Promise<Date | undefined> {
        const lastSyncDate = await this.store.getLastSyncDate(this.accountId);
        return lastSyncDate;
    }

    async updateLastInvoicesSync(syncedAt: Date): Promise<void> {
        await this.store.updateLastSyncDate(this.accountId, syncedAt);
    }

    async getPaidInvoices(after?: Date): Promise<IInvoice[]> {
        const newPaidInvoices = await this.client.invoices.getInvoices(
            {
                status: TravelPerk.InvoiceStatus.Paid,
                issuing_date_gte: after ? toShortDateFormat(after) : undefined,
            }
        );

        return newPaidInvoices.map(mapToInvoice);
    }

    async getInvoiceLines(serialNumber: string): Promise<IInvoiceLine[]> {
        const items = await this.client.invoices.getInvoiceLineItems(serialNumber);
        return items.map(mapToInvoiceLineItem);
    }

    async getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer> {
        return this.client.invoices.getInvoiceDocument(serialNumber);
    }
}

function mapToInvoice({
    serial_number,
    status, profile_id,
    profile_name,
    currency,
    total,
    due_date,
    issuing_date,
    taxes_summary,
}: TravelPerk.IInvoice): IInvoice {
    return {
        serialNumber: serial_number,
        status,
        profileId: profile_id,
        profileName: profile_name,
        currency,
        total: Number(total),
        dueDate: due_date,
        issuingDate: issuing_date,
        taxesSummary: taxes_summary.map(mapToTaxesSummaryItem),
    };
}

function mapToInvoiceLineItem(lineItem: TravelPerk.IInvoiceLine): IInvoiceLine {
    return {
        description: lineItem.description,
        taxAmount: lineItem.tax_amount,
        taxPercentage: lineItem.tax_percentage,
        totalAmount: lineItem.total_amount,
        expenseDate: lineItem.expense_date,
    };
}

function mapToTaxesSummaryItem(summaryItem: TravelPerk.ITaxesSummaryItem): ITaxesSummaryItem {
    return {
        taxAmount: Number(summaryItem.tax_amount),
    };
}
