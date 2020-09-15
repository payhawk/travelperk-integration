import { TravelPerk } from '@services';
import { IStore } from '@store';
import { ILogger } from '@utils';

import { toAccessToken } from '../../services/travelperk/client/Client';
import { IManager } from './IManager';

export class Manager implements IManager {
    constructor(
        private readonly store: IStore,
        private readonly authClient: TravelPerk.IAuth,
        private readonly accountId: string,
        private readonly logger: ILogger,
    ) {
    }

    async getAuthorizationUrl(): Promise<string> {
        const url = await this.authClient.getAuthUrl();
        return url;
    }

    async disconnect(): Promise<void> {
        await this.store.deleteAccessToken(this.accountId);
    }

    async authenticate(code: string): Promise<TravelPerk.IAccessToken> {
        const accessToken = await this.authClient.getAccessToken(code);

        await this.saveAccessToken(accessToken);

        return accessToken;
    }

    async getAccessToken(): Promise<TravelPerk.IAccessToken | undefined> {
        const accessTokenRecord = await this.store.getAccessToken(this.accountId);
        if (accessTokenRecord === undefined) {
            return undefined;
        }

        let accessToken: TravelPerk.IAccessToken | undefined = toAccessToken(accessTokenRecord.token_set);

        const isExpired = accessToken.expired();
        if (isExpired) {
            accessToken = await this.tryRefreshAccessToken(accessToken);
        }

        return accessToken;
    }

    async getPayhawkApiKey(): Promise<string> {
        const result = await this.store.getApiKey(this.accountId);
        if (!result) {
            throw Error('No API key for account');
        }

        return result;
    }

    async setPayhawkApiKey(key: string): Promise<void> {
        await this.store.setApiKey(this.accountId, key);
    }

    private async tryRefreshAccessToken(currentToken: TravelPerk.IAccessToken): Promise<TravelPerk.IAccessToken | undefined> {
        try {
            if (!currentToken.refresh_token) {
                this.logger.info('Current token is expired and cannot be refreshed. Must re-authenticate.');
                return undefined;
            }

            const refreshedAccessToken = await this.authClient.refreshAccessToken(currentToken);

            if (!refreshedAccessToken) {
                return undefined;
            }

            await this.saveAccessToken(refreshedAccessToken);
            return refreshedAccessToken;
        } catch (err) {
            const error = Error(`Failed to refresh access token - ${err.toString()}`);
            this.logger.error(error);
        }

        return undefined;
    }

    private async saveAccessToken(accessToken: TravelPerk.IAccessToken) {
        await this.store.saveAccessToken({
            account_id: this.accountId,
            token_set: accessToken,
        });
    }
}
