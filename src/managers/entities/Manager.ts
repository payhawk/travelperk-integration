import { TravelPerk } from '@services';
import { IStore } from '@store';
import { ILogger, toShortDateFormat } from '@utils';

import { IInvoice, IManager } from './contracts';

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
        const newPaidInvoices = await this.client.getInvoices(
            {
                limit: 50,
                status: TravelPerk.InvoiceStatus.Paid,
                issuing_date_gte: after ? toShortDateFormat(after) : undefined,
            }
        );

        return newPaidInvoices.map(mapToInvoice);
    }

    async getInvoiceDocument(serialNumber: string): Promise<ArrayBuffer> {
        return this.client.getInvoiceDocument(serialNumber);
    }
}

function mapToInvoice({ serial_number, status, profile_id, profile_name, currency, total, due_date, issuing_date, taxes_summary }: TravelPerk.IInvoice): IInvoice {
    return {
        serialNumber: serial_number,
        status,
        profileId: profile_id,
        profileName: profile_name,
        currency,
        total: Number(total),
        dueDate: due_date,
        issuingDate: issuing_date,
        taxesSummary: taxes_summary.map(x => ({ taxAmount: Number(x.tax_amount) })),
    };
}
