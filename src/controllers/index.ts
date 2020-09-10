import { config } from '@config';
import { Accounts, Connection, Integration } from '@managers';
import { ILogger } from '@utils';

import { AuthController } from './AuthController';
import { IntegrationController } from './IntegrationController';

export { AuthController, IntegrationController };

export const createAuthController = (logger: ILogger) => {
    return new AuthController(
        Connection.createManager,
        config,
        logger,
    );
};

export const createIntegrationController = (logger: ILogger) => {
    return new IntegrationController(
        Accounts.createManager,
        Connection.createManager,
        Integration.createManager,
        logger,
    );
};
