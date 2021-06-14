import { TravelPerk } from '@services';
import { IStore } from '@store';
import { ILogger } from '@utils';

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
        const accessTokenRecord = await this.store.getAccessToken(this.accountId);
        if (!accessTokenRecord) {
            this.logger.info('No access token found. Nothing to disconnect');
            return;
        }

        await this.authClient.revokeAccessToken(TravelPerk.toAccessToken(accessTokenRecord.token_set));
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

        let accessToken: TravelPerk.IAccessToken | undefined = TravelPerk.toAccessToken(accessTokenRecord.token_set);

        const isExpired = TravelPerk.isAccessTokenExpired(accessToken);
        if (isExpired) {
            accessToken = await this.tryRefreshAccessToken(accessToken);
        }

        return accessToken;
    }

    async getPayhawkApiKey(): Promise<string> {
        const result = await this.store.getApiKey(this.accountId);
        if (!result) {
            throw this.logger.error(Error('No API key for account'));
        }

        return result;
    }

    async setPayhawkApiKey(key: string): Promise<void> {
        await this.store.setApiKey(this.accountId, key);
    }

    private async tryRefreshAccessToken(currentToken: TravelPerk.IAccessToken): Promise<TravelPerk.IAccessToken | undefined> {
        if (!currentToken.refresh_token) {
            this.logger.info('Token set does not contain refresh token so it cannot be refreshed. Must re-authenticate.');
            return undefined;
        }

        const refreshedAccessToken = await this.authClient.refreshAccessToken(currentToken);
        if (!refreshedAccessToken) {
            return undefined;
        }

        await this.saveAccessToken(refreshedAccessToken);

        return refreshedAccessToken;
    }

    private async saveAccessToken(accessToken: TravelPerk.IAccessToken) {
        await this.store.saveAccessToken({
            account_id: this.accountId,
            token_set: accessToken,
        });
    }
}
