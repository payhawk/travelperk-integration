import { TokenSet } from 'openid-client';

import { ITokenSet } from '@store';

import { ITravelPerkClientConfig } from '../Config';
import { IHttpClient } from '../http';
import { buildUrl, IAccessToken, IAuthClient, IQuery, toUrlParams } from './contracts';

export class AuthClient implements IAuthClient {
    constructor(
        private readonly client: IHttpClient,
        private readonly config: ITravelPerkClientConfig,
    ) { }

    buildConsentUrl(): string {
        return buildAuthUrl(
            '/oauth2/authorize',
            {
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                scope: this.config.scopes.join(' '),
                response_type: 'code',
                state: this.config.state,
            }
        );
    }

    async getAccessToken(code: string): Promise<IAccessToken> {
        const requestUrl = buildAuthUrl('/accounts/oauth2/token/');

        const result = await this.client.request<ITokenSet>({
            method: 'POST',
            url: requestUrl,
            contentType: 'application/x-www-form-urlencoded',
            data: toUrlParams(
                {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.config.redirectUri,
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                }
            ),
        });

        return toAccessToken(result);
    }

    async refreshAccessToken(currentToken: IAccessToken): Promise<IAccessToken> {
        const requestUrl = buildAuthUrl('/accounts/oauth2/token/');

        const result = await this.client.request<ITokenSet>({
            method: 'POST',
            url: requestUrl,
            contentType: 'application/x-www-form-urlencoded',
            data: toUrlParams(
                {
                    grant_type: 'refresh_token',
                    refresh_token: currentToken.refresh_token,
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                }
            ),
        });

        return toAccessToken(result);
    }

    async revokeAccessToken(currentToken: IAccessToken): Promise<void> {
        const requestUrl = buildAuthUrl('/accounts/oauth2/revoke_token/');

        await this.client.request<ITokenSet>({
            method: 'POST',
            url: requestUrl,
            contentType: 'application/x-www-form-urlencoded',
            data: toUrlParams(
                {
                    token_type_hint: 'refresh_token',
                    token: currentToken.refresh_token,
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                }
            ),
        });
    }
}

export const toAccessToken = (tokenSet: ITokenSet): IAccessToken => {
    return new TokenSet({ ...tokenSet }) as IAccessToken;
};

export const isAccessTokenExpired = (accessToken: IAccessToken): boolean => {
    return !Number.isInteger(accessToken.expires_in) || accessToken.expires_in <= MIN_EXPIRATION_TIME;
};

function buildAuthUrl(path: string, query?: IQuery): string {
    return buildUrl(AUTH_BASE_PATH, path, query);
}

const AUTH_BASE_PATH = 'https://app.travelperk.com';

const MIN_EXPIRATION_TIME = 60; // seconds
