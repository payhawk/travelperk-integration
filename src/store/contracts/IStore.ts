import { INewUserTokenSetRecord, IUserTokenSetRecord } from './IUserTokenSet';

export interface IStore {
    getAllTokenSets(): Promise<IUserTokenSetRecord[]>;
    saveAccessToken(record: INewUserTokenSetRecord): Promise<void>;
    getAccessToken(accountId: string): Promise<IUserTokenSetRecord | undefined>;
    getApiKey(accountId: string): Promise<string | undefined>;
    setApiKey(accountId: string, apiKey: string): Promise<void>;
}

export interface ISchemaStore extends IStore {
    initSchema(): Promise<void>;
    ensureSchemaVersion(): Promise<void>;
}
