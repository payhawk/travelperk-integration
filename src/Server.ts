import * as restify from 'restify';

import { config } from '@config';
import { requestHandler } from '@utils';

import { Controller } from './controllers';

export const createServer = (controller: Controller): restify.Server => {
    const server = restify.createServer({ name: config.serviceName });

    server
        .use(restify.plugins.jsonBodyParser())
        .use(restify.plugins.queryParser())
        .use(securityHeadersMiddleware());

    // Endpoint used to check whether the service is up and running
    server.get('/status', (req, res) => res.send(200, 'OK'));

    server.get('/connect', requestHandler(controller.connect));
    server.get('/callback', requestHandler(controller.callback));

    // server.post('/payhawk', requestHandler(controller.payhawk));

    return server;
};

function securityHeadersMiddleware(): restify.RequestHandler {
    return (request: restify.Request, response: restify.Response, next: restify.Next) => {
        response.set({
            'X-Frame-Options': 'DENY',
            // cspell:disable-next
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'X-Permitted-Cross-Domain-Policies': 'none',
            'Content-Security-Policy': `default-src 'none'`,
        });

        next();
    };
}
