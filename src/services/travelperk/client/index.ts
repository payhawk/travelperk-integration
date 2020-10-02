import { ILogger } from '@utils';

import { ITravelPerkClientConfig } from '../Config';
import { createHttpClient } from '../http';
import { AuthClient } from './AuthClient';
import { Client } from './Client';
import { IClient } from './contracts';
import { InvoicesClient } from './InvoicesClient';

export * from './contracts';

export * from './Client';
export { toAccessToken } from './AuthClient';

export const createClient: (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => IClient =
    (accessToken: string | undefined, config: ITravelPerkClientConfig, logger: ILogger) => {
        const httpClient = createHttpClient(accessToken, logger);
        return new Client(
            new AuthClient(httpClient, config),
            new InvoicesClient(httpClient),
        );
    };
