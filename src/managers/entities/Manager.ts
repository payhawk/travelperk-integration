import * as moment from 'moment';

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

    async getPaidInvoicesSinceLastSync(): Promise<IInvoice[]> {
        const lastSyncDate = await this.store.getLastSyncDate(this.accountId);

        const now = moment.utc().toDate();
        const nowFormatted = toShortDateFormat(now);

        const invoicesForToday = await this.client.getInvoices(
            {
                limit: 50,
                status: TravelPerk.InvoiceStatus.Paid,
                issuing_date_gte: lastSyncDate ? nowFormatted : undefined,
                issuing_date_lte: nowFormatted,
            }
        );

        await this.store.updateLastSyncDate(this.accountId, now);

        const invoicesForTodayNotYetSynced = invoicesForToday
        .filter(i => moment.utc(i.issuing_date).toDate().getTime() > (lastSyncDate ? lastSyncDate.getTime() : 0))
        .map(mapToInvoice);

        return invoicesForTodayNotYetSynced;
    }
}

function mapToInvoice({ serial_number, status, profile_id, profile_name, currency, total, due_date, issuing_date }: TravelPerk.IInvoice): IInvoice {
    return {
        serialNumber: serial_number,
        status,
        profileId: profile_id,
        profileName: profile_name,
        currency,
        total,
        dueDate: due_date,
        issuingDate: issuing_date,
    };
}
