import { TravelPerk } from '@services';
import { ILogger } from '@utils';

import { IManager } from './contracts/IManager';
import { Manager } from './Manager';

export { IManager };

export type IManagerFactory = (client: TravelPerk.IClient, logger: ILogger) => IManager;

export const createManager: IManagerFactory = (client: TravelPerk.IClient, logger: ILogger) => new Manager(client, logger);
