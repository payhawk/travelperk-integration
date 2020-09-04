import { ILogger } from '@utils';

import { ITravelPerkClientConfig } from '../Config';
import { ITravelPerkHttpClient } from './ITravelPerkHttpClient';
import { TravelPerkHttpClient } from './TravelPerkHttpClient';

export * from './ITravelPerkHttpClient';

export const createTravelPerkHttpClient: (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => ITravelPerkHttpClient =
    (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => new TravelPerkHttpClient(accessToken, config, logger);
