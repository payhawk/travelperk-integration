import { URL, URLSearchParams } from 'url';

import { Next, Request, Response } from 'restify';

import { IConfig } from '@config';
import { Connection } from '@managers';
import { fromBase64, ILogger, requiredQueryParams } from '@utils';

export class Controller {
    constructor(
        private readonly connectionManagerFactory: Connection.IManagerFactory,
        private readonly config: IConfig,
        private readonly baseLogger: ILogger,
    ) { }

    @requiredQueryParams('accountId')
    async connect(req: Request, res: Response, next: Next) {
        const { accountId, returnUrl: queryReturnUrl } = req.query;
        const returnUrl = queryReturnUrl || '/';

        const logger = this.baseLogger.child({ accountId, returnUrl }, req);

        logger.info('Connect started');

        const connectionManager = this.connectionManagerFactory({ accountId, returnUrl }, logger);
        const authorizationUrl = await connectionManager.getAuthorizationUrl();
        res.redirect(authorizationUrl, next);

        logger.info('Connect completed');
    }

    @requiredQueryParams('state')
    async callback(req: Request, res: Response, next: Next) {
        const { code, error, state: encodedState } = req.query;

        const state = new URLSearchParams(fromBase64(encodedState));
        const accountId = state.get('accountId');
        const returnUrl = state.get('returnUrl');
        if (!accountId || !returnUrl) {
            this.baseLogger.error(Error('State param does not contain required account ID and return URL'));
            res.send(500);
            return;
        }

        const absoluteReturnUrl = `${this.config.portalUrl}${returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`}`;
        const url = new URL(absoluteReturnUrl);

        const logger = this.baseLogger.child({ accountId }, req);
        if (error) {
            logger.info('TravelPerk authorization declined. Redirecting to portal...');

            url.searchParams.set('error', error);
            res.redirect(url.toString(), next);
            return;
        }

        logger.info('Callback start');

        if (!code) {
            logger.error(Error('Auth code is required for retrieving access token'));
            res.send(500);
            return;
        }

        const connectionManager = this.connectionManagerFactory({ accountId }, logger);
        const accessToken = await connectionManager.authenticate(req.url!);
        if (!accessToken) {
            logger.error(Error('Could not create access token from callback'));
            res.send(401);
            return;
        }

        url.searchParams.append('connection', 'travelperk');
        url.searchParams.append('label', 'TravelPerk Test');

        res.redirect(url.toString(), next);

        logger.info('Callback complete');
    }
}