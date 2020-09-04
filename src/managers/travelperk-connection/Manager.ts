import { TravelPerk } from '@services';
import { IStore, ITokenSet } from '@store';
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

    async authenticate(verifier: string): Promise<ITokenSet | undefined> {
        const accessToken = await this.authClient.getAccessToken(verifier);

        await this.saveAccessToken(accessToken);

        return accessToken.tokenSet;
    }

    async getAccessToken(): Promise<ITokenSet | undefined> {
        const accessTokenRecord = await this.store.getAccessToken(this.accountId);
        if (accessTokenRecord === undefined) {
            return undefined;
        }

        let accessToken: ITokenSet | undefined = accessTokenRecord.token_set;

        const isExpired = accessToken.expired();
        if (isExpired) {
            accessToken = await this.tryRefreshAccessToken(accessToken);
        }

        return accessToken;
    }

    private async tryRefreshAccessToken(currentToken: ITokenSet): Promise<ITokenSet | undefined> {
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
            return refreshedAccessToken.tokenSet;
        } catch (err) {
            const error = Error(`Failed to refresh access token - ${err.toString()}`);
            this.logger.error(error);
        }

        return undefined;
    }

    private async saveAccessToken(accessToken: TravelPerk.IAccessToken) {
        await this.store.saveAccessToken({
            account_id: this.accountId,
            token_set: accessToken.tokenSet,
        });
    }
}
