import * as restify from 'restify';

import { config } from '@config';
import { AuthController, IntegrationController } from '@controllers';
import { requestHandler } from '@utils';

export const createServer = (authController: AuthController, integrationController: IntegrationController): restify.Server => {
    const server = restify.createServer({ name: config.serviceName });

    server
        .use(restify.plugins.jsonBodyParser())
        .use(restify.plugins.queryParser())
        .use(securityHeadersMiddleware());

    // Endpoint used to check whether the service is up and running
    server.get('/status', (req, res) => res.send(200, 'OK'));

    server.get('/connect', requestHandler(authController.connect));
    server.get('/callback', requestHandler(authController.callback));

    server.post('/payhawk', requestHandler(integrationController.payhawk));
    server.get('/payhawk/connection-status', requestHandler(authController.getConnectionStatus));

    return server;
};

export const createWorker = (controller: IntegrationController): restify.Server => {
    const server = restify.createServer({ name: `${config.serviceName} Worker` });

    server
        .use(restify.plugins.jsonBodyParser())
        .use(restify.plugins.queryParser())
        .use(securityHeadersMiddleware());

    server.post('/travelperk-invoices-sync', requestHandler(controller.syncInvoices));

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
