import { Pool } from 'pg';

import { createLogger, ILogger } from '@utils';

import { SCHEMA } from './Config';
import { ISchemaStore, IStore } from './contracts';
import { PgStore } from './PgStore';

export {
    IStore,
    ITokenSet,
    INewPayhawkApiKeyRecord,
    IPayhawkApiKeyRecord,
    INewUserTokenSetRecord,
    IUserTokenSetRecord,
} from './contracts';

const pool = new Pool();
pool.on('connect', async client => {
    await client.query(`SET "search_path" TO "${SCHEMA.NAME}"`);
});

export const createStore = (logger?: ILogger): IStore => {
    return new PgStore(pool, logger || createLogger());
};

export const initialize = async () => {
    const pgStore = createStore() as ISchemaStore;
    await pgStore.initSchema();
};

export const ensureSchemaVersion = async () => {
    const pgStore = createStore() as ISchemaStore;
    await pgStore.ensureSchemaVersion();
};
