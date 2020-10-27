import {Mock, Times} from 'typemoq';

import { ITravelPerkClientConfig } from '../Config';
import { IHttpClient } from '../http';
import { AuthClient, isAccessTokenExpired } from './AuthClient';

describe('TravelPerk auth client tests', () => {
    const httpMock = Mock.ofType<IHttpClient>();
    const config: ITravelPerkClientConfig = {
        clientId: 'client_id',
        clientSecret: 'client_secret',
        redirectUri: 'http://adapter',
        scopes: ['invoices'],
        state: '123',
    };

    const client = new AuthClient(httpMock.object, config);

    it('should build consent URL', () => {
        const url = client.buildConsentUrl();
        expect(url).toEqual('https://app.travelperk.com/oauth2/authorize?client_id=client_id&redirect_uri=http%3A%2F%2Fadapter&scope=invoices&response_type=code&state=123');
    });

    it('should send request to get access token', async () => {
        const code = 'code';

        httpMock
            .setup(x => x.request({
                url: 'https://app.travelperk.com/accounts/oauth2/token/',
                method: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(config.redirectUri)}&client_id=${config.clientId}&client_secret=${config.clientSecret}`,
            }))
            .returns(async () => ({}))
            .verifiable(Times.once());

        await client.getAccessToken(code);
    });

    it('should send request to refresh access token', async () => {
        const token: any = { refresh_token: 'refresh' };

        httpMock
            .setup(x => x.request({
                url: 'https://app.travelperk.com/accounts/oauth2/token/',
                method: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: `grant_type=refresh_token&refresh_token=${token.refresh_token}&client_id=${config.clientId}&client_secret=${config.clientSecret}`,
            }))
            .returns(async () => ({}))
            .verifiable(Times.once());

        await client.getAccessToken(token);
    });

    it('should send request to revoke access token', async () => {
        const token: any = { refresh_token: 'refresh' };

        httpMock
            .setup(x => x.request({
                url: 'https://app.travelperk.com/accounts/oauth2/revoke_token/',
                method: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: `token_type_hint=refresh_token&token=${token.refresh_token}&client_id=${config.clientId}&client_secret=${config.clientSecret}`,
            }))
            .returns(async () => ({}))
            .verifiable(Times.once());

        await client.revokeAccessToken(token);
    });

    describe('isTokenExpired()', () => {
        it('should return false for NaN', () => {
            expect(isAccessTokenExpired({ expires_in: NaN } as any)).toEqual(true);
        });

        it('should return false for 10 sec', () => {
            expect(isAccessTokenExpired({ expires_in: 10 } as any)).toEqual(true);
        });

        it('should return true for 2 min', () => {
            expect(isAccessTokenExpired({ expires_in: 2 * 60 } as any)).toEqual(false);
        });
    });
});
