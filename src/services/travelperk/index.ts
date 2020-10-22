import { ITokenSet } from '@store';
import { ILogger } from '@utils';

import { Auth, IAuth } from './auth';
import {
    createClient,
    IAccessToken,
    IClient,
    IInvoice,
    IInvoiceLineItem,
    InvoiceStatus,
    ITaxesSummaryItem,
    toAccessToken,
} from './client';
import { getTravelPerkConfig } from './Config';

export {
    IAuth,
    ITokenSet,
    IClient,
    IAccessToken,
    IInvoice,
    IInvoiceLineItem,
    ITaxesSummaryItem,
    InvoiceStatus,
    createClient,
    getTravelPerkConfig,
    toAccessToken,
};

export const createAuth = ({ accountId, returnUrl }: IAuthParams, logger: ILogger): IAuth => {
    return new Auth(createClient(undefined, getTravelPerkConfig(accountId, returnUrl), logger), logger);
};

export interface IAuthParams {
    accountId: string;
    returnUrl?: string;
}
