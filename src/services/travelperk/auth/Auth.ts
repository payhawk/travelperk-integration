import { ITokenSet } from '@store';
import { ILogger } from '@utils';

import { ITravelPerkHttpClient } from '../http';
import { IAccessToken, IAuth } from './IAuth';

export class Auth implements IAuth {

    constructor(
        private readonly client: ITravelPerkHttpClient,
        // @ts-ignore
        private readonly logger: ILogger,
        ) {
    }

    async getAuthUrl(): Promise<string> {
        return this.client.buildConsentUrl();
    }

    async getAccessToken(verifier: string): Promise<IAccessToken> {
        return this.client.getAccessToken(verifier);
    }

    async refreshAccessToken(currentToken?: ITokenSet): Promise<IAccessToken | undefined> {
        return this.client.refreshAccessToken();
    }
}
