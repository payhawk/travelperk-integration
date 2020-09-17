import { URL, URLSearchParams } from 'url';

import { boundMethod } from 'autobind-decorator';
import { Next, Request, Response } from 'restify';

import { IConfig } from '@config';
import { Connection } from '@managers';
import { fromBase64, ILogger, requiredQueryParams } from '@utils';

import { IConnectionStatus } from './contracts';

export class AuthController {
    constructor(
        private readonly connectionManagerFactory: Connection.IManagerFactory,
        private readonly config: IConfig,
        private readonly baseLogger: ILogger,
    ) { }

    @boundMethod
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

    @boundMethod
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
        const accessToken = await connectionManager.authenticate(code);
        if (!accessToken) {
            logger.error(Error('Could not create access token from callback'));
            res.send(401);
            return;
        }

        url.searchParams.append('connection', 'travelperk');

        res.redirect(url.toString(), next);

        logger.info('Callback complete');
    }

    @boundMethod
    @requiredQueryParams('accountId')
    async getConnectionStatus(req: Request, res: Response) {
        const { accountId } = req.query;

        const logger = this.baseLogger.child({ accountId }, req);

        const connectionManager = this.connectionManagerFactory({ accountId }, logger);
        const accessToken = await connectionManager.getAccessToken();

        const connectionStatus: IConnectionStatus = {
            isAlive: accessToken !== undefined && !connectionManager.isAccessTokenExpired(accessToken),
        };

        res.send(200, connectionStatus);
    }
}
