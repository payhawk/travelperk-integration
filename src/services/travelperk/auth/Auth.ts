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
        return this.client.auth.buildConsentUrl();
    }

    async getAccessToken(code: string): Promise<IAccessToken> {
        return this.client.auth.getAccessToken(code);
    }

    async refreshAccessToken(currentToken: IAccessToken): Promise<IAccessToken> {
        return this.client.auth.refreshAccessToken(currentToken);
    }

    async revokeAccessToken(currentToken: IAccessToken): Promise<void> {
        return this.client.auth.revokeAccessToken(currentToken);
    }
}
