import { Client } from './Client';
import { IClient, IDocument } from './IClient';

export { IClient, IDocument };

export const createClient = (accountId: string, apiKey: string): IClient => {
    return new Client(accountId, apiKey);
};
