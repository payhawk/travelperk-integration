import * as TypeMoq from 'typemoq';

import { ITravelPerkClientConfig } from '../Config';
import { IHttpClient } from '../http';
import { AuthClient } from './AuthClient';
import { Client } from './Client';
import { InvoicesClient } from './InvoicesClient';

describe('TravelPerk client tests', () => {
    const httpMock = TypeMoq.Mock.ofType<IHttpClient>();
    const config: ITravelPerkClientConfig = {
        clientId: 'client_id',
        clientSecret: 'client_secret',
        redirectUri: 'http://adapter',
        scopes: ['invoices'],
        state: '123',
    };

    const client = new Client(
        new AuthClient(httpMock.object, config),
        new InvoicesClient(httpMock.object),
    );

    it('should build consent URL', () => {
        const url = client.auth.buildConsentUrl();
        expect(url).toEqual('https://app.travelperk.com/oauth2/authorize?client_id=client_id&redirect_uri=http%3A%2F%2Fadapter&scope=invoices&response_type=code&state=123');
    });
});
