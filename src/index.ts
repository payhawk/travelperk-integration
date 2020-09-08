// tslint:disable-next-line: no-var-requires
require('module-alias').addAliases({
    '@config': `${__dirname}/config`,
    '@controllers': `${__dirname}/controllers`,
    '@managers': `${__dirname}/managers`,
    '@services': `${__dirname}/services`,
    '@store': `${__dirname}/store`,
    '@utils': `${__dirname}/utils`,
});

import { createAuthController, createIntegrationController } from '@controllers';
import * as Store from '@store';
import { createLogger } from '@utils';

import { createServer, createWorker } from './Server';

// tslint:disable-next-line:no-var-requires
require('source-map-support').install();

(async () => {
    await Store.initialize();

    const logger = createLogger();
    const authController = createAuthController(logger);
    const integrationController = createIntegrationController(logger);

    const server = createServer(authController, integrationController);
    const worker = createWorker(integrationController);

    const stop = async () => await Promise.all([server.close(), worker.close()]);

    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
    process.on('warning', warning => console.error(warning));

    server.listen(8080, () => console.log('%s listening at %s', server.name, server.url));
    worker.listen(8050, () => console.log('%s listening at %s', worker.name, worker.url));
})().catch(err => console.error(err));
