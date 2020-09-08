import { ILogger } from '@utils';

import { ITravelPerkClientConfig } from '../Config';
import { createHttpClient } from '../http';
import { Client } from './Client';
import { IClient } from './contracts';

export * from './contracts';

export * from './Client';

export const createClient: (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => IClient =
    (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => new Client(
        createHttpClient(accessToken, logger),
        config,
    );
