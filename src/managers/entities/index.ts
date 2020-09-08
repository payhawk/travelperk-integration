import { TravelPerk } from '@services';
import { IStore } from '@store';
import { ILogger } from '@utils';

import { IManager } from './contracts/IManager';
import { Manager } from './Manager';

export { IManager };

export type IManagerFactory = (client: TravelPerk.IClient, store: IStore, accountId: string, logger: ILogger) => IManager;

export const createManager: IManagerFactory = (client: TravelPerk.IClient, store: IStore, accountId: string, logger: ILogger) => new Manager(client, store, accountId, logger);
