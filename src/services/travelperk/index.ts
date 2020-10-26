import { ITokenSet } from '@store';
import { ILogger } from '@utils';

import { Auth, IAuth } from './auth';
import {
    createClient,
    IAccessToken,
    IClient,
    IInvoice,
    IInvoiceLine,
    InvoiceStatus,
    isAccessTokenExpired,
    ITaxesSummaryItem,
    toAccessToken,
} from './client';
import { getTravelPerkConfig } from './Config';
import { ForbiddenError, UnauthorizedError } from './http';

export {
    IAuth,
    ITokenSet,
    IClient,
    IAccessToken,
    IInvoice,
    IInvoiceLine,
    ITaxesSummaryItem,
    InvoiceStatus,
    createClient,
    getTravelPerkConfig,
    toAccessToken,
    isAccessTokenExpired,
    ForbiddenError,
    UnauthorizedError,
};

export const createAuth = ({ accountId, returnUrl }: IAuthParams, logger: ILogger): IAuth => {
    return new Auth(createClient(undefined, getTravelPerkConfig(accountId, returnUrl), logger), logger);
};

export interface IAuthParams {
    accountId: string;
    returnUrl?: string;
}
