import { ILogger } from '@utils';

import { ITravelPerkClientConfig } from '../Config';
import { HttpClient } from './HttpClient';
import { ITravelPerkHttpClient } from './ITravelPerkClient';
import { TravelPerkHttpClient } from './TravelPerkClient';

export * from './ITravelPerkClient';

export const createTravelPerkHttpClient: (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => ITravelPerkHttpClient =
    (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => new TravelPerkHttpClient(
        new HttpClient(accessToken, logger),
        config,
    );
