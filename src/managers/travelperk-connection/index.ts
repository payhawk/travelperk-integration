import { TravelPerk } from '@services';
import { createStore, IStore } from '@store';
import { ILogger } from '@utils';

import { IManager } from './IManager';
import { Manager } from './Manager';

export { IStore, IManager };

export type IManagerFactory = (params: TravelPerk.IAuthParams, logger: ILogger) => IManager;

export const createManager: IManagerFactory = ({ accountId, returnUrl }: TravelPerk.IAuthParams, logger: ILogger): IManager => {
    return new Manager(
        createStore(logger),
        TravelPerk.createAuth({ accountId, returnUrl }, logger),
        accountId,
        logger,
    );
};
