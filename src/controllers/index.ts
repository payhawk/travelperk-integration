import { config } from '@config';
import { Connection } from '@managers';
import { createLogger } from '@utils';

import { Controller } from './Controller';

export { Controller };

export const create = () => {
    const logger = createLogger();
    return new Controller(Connection.createManager, config, logger);
};
