// tslint:disable-next-line: no-var-requires
require('module-alias').addAliases({
    '@config': `${__dirname}/config`,
    '@controllers': `${__dirname}/controllers`,
    '@managers': `${__dirname}/managers`,
    '@services': `${__dirname}/services`,
    '@store': `${__dirname}/store`,
    '@utils': `${__dirname}/utils`,
});

import { create as createController } from '@controllers';
import * as Store from '@store';

import { createServer } from './Server';

// tslint:disable-next-line:no-var-requires
require('source-map-support').install();

(async () => {
    await Store.initialize();

    const controller = createController();
    const server = createServer(controller);

    const stop = async () => await server.close();
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
    process.on('warning', warning => console.error(warning));

    server.listen(8080, () => console.log('%s listening at %s', server.name, server.url));
})().catch(err => console.error(err));
