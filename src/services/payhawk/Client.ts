import { IClient } from './IClient';

export class Client implements IClient {
    // @ts-ignore
    private readonly headers: { [key: string]: string };

    // @ts-ignore
    constructor(private readonly accountId: string, apiKey: string) {
        this.headers = {
            'X-Payhawk-ApiKey': apiKey,
        };
    }
}
