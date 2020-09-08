import { ITokenSet } from '@store';
import { ILogger } from '@utils';

import { Auth, IAuth } from './auth';
import {
    createClient,
    IAccessToken,
    IClient,
    IInvoice,
} from './client';
import { getTravelPerkConfig } from './Config';

export {
    IAuth,
    ITokenSet,
    IClient,
    IAccessToken,
    IInvoice,
    createClient,
    getTravelPerkConfig,
};

export const createAuth = ({ accountId, returnUrl }: IAuthParams, logger: ILogger): IAuth => {
    return new Auth(createClient(undefined, getTravelPerkConfig(accountId, returnUrl), logger), logger);
};

export interface IAuthParams {
    accountId: string;
    returnUrl?: string;
}
