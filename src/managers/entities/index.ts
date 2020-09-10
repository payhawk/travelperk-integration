import { TravelPerk } from '@services';
import { IStore } from '@store';
import { ILogger } from '@utils';

import { Currency, IInvoice, IManager } from './contracts';
import { Manager } from './Manager';

export { IManager, IInvoice, Currency };

export type IManagerFactory = (client: TravelPerk.IClient, store: IStore, accountId: string, logger: ILogger) => IManager;

export const createManager: IManagerFactory = (
    client: TravelPerk.IClient,
    store: IStore,
    accountId: string,
    logger: ILogger,
) => new Manager(
    client,
    store,
    accountId,
    logger,
);
