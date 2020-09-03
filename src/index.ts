// tslint:disable-next-line: no-var-requires
require('module-alias').addAliases({
    '@controllers': `${__dirname}/controllers`,
    '@utils': `${__dirname}/utils`,
});

import { create as createController } from '@controllers';

import { createServer } from './Server';

// tslint:disable-next-line:no-var-requires
require('source-map-support').install();

(async () => {
    const controller = createController();
    const server = createServer(controller);

    const stop = async () => await server.close();
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
    process.on('warning', warning => console.error(warning));

    server.listen(8080, () => console.log('%s listening at %s', server.name, server.url));
})().catch(err => console.error(err));
