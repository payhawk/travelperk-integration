import { ITokenSet } from '@store';
import { ILogger } from '@utils';

import { Auth, IAuth } from './auth';
import {
    Client,
    IClient,
} from './client';
import { getTravelPerkConfig } from './Config';
import { createTravelPerkHttpClient, IAccessToken } from './http';

export {
    IAuth,
    ITokenSet,
    IClient,
    IAccessToken,
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
