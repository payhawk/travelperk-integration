import { KeyNameMap } from '@utils';

export interface IInvoicesSyncHistoryItemRecord {
    account_id: string;
    last_sync_at: string;
}

export const SyncHistoryItemRecordKeys: KeyNameMap<IInvoicesSyncHistoryItemRecord> = {
    account_id: 'account_id',
    last_sync_at: 'last_sync_at',
};
