import * as fs from 'fs';

import * as moment from 'moment';
import { Pool } from 'pg';

import { ILogger } from '@utils';

import { SCHEMA } from './Config';
import { IInvoicesSyncHistoryItemRecord, INewUserTokenSetRecord, ISchemaStore, IUserTokenSetRecord, PayhawkApiKeyRecordKeys, SyncHistoryItemRecordKeys, UserTokenSetRecordKeys } from './contracts';

export class PgStore implements ISchemaStore {

    constructor(private readonly pgClient: Pool, private readonly logger: ILogger) {
    }

    async getAllTokenSets(): Promise<IUserTokenSetRecord[]> {
        const result = await this.pgClient.query<IUserTokenSetRecord>({
            text: `SELECT * FROM "${SCHEMA.TABLE_NAMES.ACCESS_TOKENS}"`,
        });

        return result.rows;
    }

    async saveAccessToken({ account_id, token_set }: INewUserTokenSetRecord): Promise<void> {
        await this.pgClient.query({
            text: `
                INSERT INTO "${SCHEMA.TABLE_NAMES.ACCESS_TOKENS}" (
                    "${UserTokenSetRecordKeys.account_id}",
                    "${UserTokenSetRecordKeys.token_set}"
                )
                VALUES ($1, $2)
                ON CONFLICT ("${UserTokenSetRecordKeys.account_id}")
                DO
                    UPDATE SET
                        "${UserTokenSetRecordKeys.token_set}" = $2,
                        "${UserTokenSetRecordKeys.updated_at}" = now();
            `,
            values: [
                account_id,
                token_set,
            ],
        });
    }

    async getAccessToken(accountId: string): Promise<IUserTokenSetRecord | undefined> {
        const query = await this.pgClient.query<IUserTokenSetRecord>({
            text: `
                SELECT * FROM "${SCHEMA.TABLE_NAMES.ACCESS_TOKENS}"
                WHERE "${UserTokenSetRecordKeys.account_id}"=$1
            `,
            values: [
                accountId,
            ],
        });

        const record = query.rows[0];
        return record;
    }

    async deleteAccessToken(accountId: string): Promise<void> {
        await this.pgClient.query<IUserTokenSetRecord>({
            text: `
                DELETE FROM "${SCHEMA.TABLE_NAMES.ACCESS_TOKENS}"
                WHERE "${UserTokenSetRecordKeys.account_id}"=$1
            `,
            values: [
                accountId,
            ],
        });
    }

    async getApiKey(accountId: string): Promise<string|undefined> {
        const query = await this.pgClient.query<{ key: string }>({
            text: `
                SELECT "${PayhawkApiKeyRecordKeys.key}" FROM "${SCHEMA.TABLE_NAMES.PAYHAWK_API_KEYS}"
                WHERE "${PayhawkApiKeyRecordKeys.account_id}" = $1
            `,
            values: [accountId],
        });

        if (query.rows.length > 0) {
            return query.rows[0].key;
        } else {
            return undefined;
        }
    }

    async setApiKey(accountId: string, key: string): Promise<void> {
        await this.pgClient.query<{ payhawk_api_key: string }>({
            text: `
                INSERT INTO "${SCHEMA.TABLE_NAMES.PAYHAWK_API_KEYS}" ("${PayhawkApiKeyRecordKeys.account_id}", "${PayhawkApiKeyRecordKeys.key}")
                VALUES ($1, $2)
                ON CONFLICT ("${PayhawkApiKeyRecordKeys.account_id}")
                DO
                    UPDATE SET "${PayhawkApiKeyRecordKeys.key}" = $2, "${PayhawkApiKeyRecordKeys.updated_at}" = NOW()
            `,
            values: [accountId, key],
        });
    }

    async getLastSyncDate(accountId: string): Promise<Date | undefined> {
        const query = await this.pgClient.query<Pick<IInvoicesSyncHistoryItemRecord, 'last_sync_at'>>({
            text: `
                SELECT "${SyncHistoryItemRecordKeys.last_sync_at}" FROM "${SCHEMA.TABLE_NAMES.INVOICES_SYNC_HISTORY}"
                WHERE "${PayhawkApiKeyRecordKeys.account_id}" = $1
            `,
            values: [accountId],
        });

        if (query.rows.length > 0) {
            return moment.utc(query.rows[0].last_sync_at).toDate();
        }

        return undefined;
    }

    async updateLastSyncDate(accountId: string, lastSyncAt: Date): Promise<void> {
        await this.pgClient.query({
            text: `
                INSERT INTO "${SCHEMA.TABLE_NAMES.INVOICES_SYNC_HISTORY}"
                    ("${SyncHistoryItemRecordKeys.account_id}", "${SyncHistoryItemRecordKeys.last_sync_at}")
                VALUES ($1, $2)
                ON CONFLICT ("${SyncHistoryItemRecordKeys.account_id}")
                DO
                    UPDATE SET "${SyncHistoryItemRecordKeys.last_sync_at}" = $2
            `,
            values: [accountId, lastSyncAt],
        });
    }

    async initSchema(): Promise<void> {
        await this.pgClient.query(await readSchemaInitScript());
    }

    async ensureSchemaVersion(): Promise<void> {
        await this.applyMigration();
    }

    private async applyMigration(): Promise<void> {
        await this.applyDatabaseMigration();
    }

    private async applyDatabaseMigration(): Promise<void> {
        const fileName = `migration.sql`;
        if (!scriptExists(fileName)) {
            this.logger.info('Database migration skipped. No script');
            return;
        }

        try {
            this.logger.info('Database migration started');

            const scriptText = await readScript(fileName);
            await this.pgClient.query(scriptText);

            this.logger.info('Database migration finished');
        } catch (err) {
            const error = Error(`Database migration script failed: ${err.toString()}`);

            this.logger.error(error);
        }
    }
}

const readSchemaInitScript = async (): Promise<string> => {
    return readScript('init.schema.sql');
};

const readScript = async (name: string): Promise<string> => {
    return await new Promise<string>((resolve, reject) => {
        fs.readFile(getPathFullName(name), 'utf8', (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
};

const scriptExists = (name: string): boolean => {
    return fs.existsSync(getPathFullName(name));
};

const getPathFullName = (fileName: string): string => {
    return `${process.cwd()}/assets/${fileName}`;
};
