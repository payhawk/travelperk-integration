import { ILogger } from '@utils';

import { IAccessToken, IClient } from '../client';
import { IAuth } from './IAuth';

export class Auth implements IAuth {

    constructor(
        private readonly client: IClient,
        // @ts-ignore
        private readonly logger: ILogger,
        ) {
    }

    async getAuthUrl(): Promise<string> {
        return this.client.buildConsentUrl();
    }

    async getAccessToken(code: string): Promise<IAccessToken> {
        return this.client.getAccessToken(code);
    }

    async refreshAccessToken(currentToken: IAccessToken): Promise<IAccessToken> {
        return this.client.refreshAccessToken(currentToken);
    }
}
