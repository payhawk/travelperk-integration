import { ITokenSet } from '@store';
import { ILogger } from '@utils';

import { Auth, IAccessToken, IAuth } from './auth';
import {
    Client,
    IClient,
} from './client';
import { getTravelPerkConfig } from './Config';
import { createTravelPerkHttpClient } from './http';

export {
    IAuth,
    IAccessToken,
    IClient,
};

export const createAuth = ({ accountId, returnUrl }: IAuthParams, logger: ILogger): IAuth => {
    return new Auth(createTravelPerkHttpClient(undefined, getTravelPerkConfig(accountId, returnUrl), logger), logger);
};

export const createClient = (accessToken: ITokenSet, logger: ILogger): IClient => {
    return new Client({} as any, logger);
};

export interface IAuthParams {
    accountId: string;
    returnUrl?: string;
}
