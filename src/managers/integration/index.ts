import { Payhawk, TravelPerk } from '@services';
import { ILogger } from '@utils';

import { createStore } from '../../store';
import * as Entities from '../entities';
import { IManager } from './IManager';
import { Manager } from './Manager';

export { IManager };

export type IManagerFactory = (params: IManagerFactoryParams, logger: ILogger) => IManager;

export interface IManagerFactoryParams {
    accessToken: TravelPerk.IAccessToken;
    accountId: string;
    payhawkApiKey: string;
}

export const createManager: IManagerFactory = ({ accessToken, accountId, payhawkApiKey }, logger: ILogger): IManager => {
    const payhawkClient = Payhawk.createClient(accountId, payhawkApiKey);
    const travelPerkClient = TravelPerk.createClient(accessToken.access_token, TravelPerk.getTravelPerkConfig(accountId), logger);
    const entities = Entities.createManager(travelPerkClient, createStore(logger), accountId, logger);

    return new Manager(
        payhawkClient,
        entities,
        logger,
    );
};
