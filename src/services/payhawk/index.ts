import { Client } from './Client';
import { IClient } from './IClient';

export { IClient };

export const createClient = (accountId: string, apiKey: string): IClient => {
    return new Client(accountId, apiKey);
};
