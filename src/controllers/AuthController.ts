import * as crypto from 'crypto';
import { URL, URLSearchParams } from 'url';

import { boundMethod } from 'autobind-decorator';
import { Next, Request, Response } from 'restify';

import { IConfig } from '@config';
import { Connection } from '@managers';
import { TravelPerk } from '@services';
import { fromBase64, ILogger, requiredQueryParams } from '@utils';

import { ConnectionMessage, IAccount, IConnectionStatus } from './contracts';

export class AuthController {
    constructor(
        private readonly connectionManagerFactory: Connection.IManagerFactory,
        private readonly config: IConfig,
        private readonly baseLogger: ILogger,
    ) { }

    @boundMethod
    async connect(req: Request, res: Response, next: Next) {
        const { accounts: accountsQueryString, accountId, returnUrl: queryReturnUrl } = req.query;
        const returnUrl = queryReturnUrl || '/';

        let logger = this.baseLogger;

        if (!accountsQueryString && !accountId) {
            logger.error(Error('Account is required'));
            res.send(500);
            return;
        }

        logger.info('Connect started');

        if (accountId) {
            logger = this.baseLogger.child({ accountId, returnUrl }, req);

            const connectionManager = this.connectionManagerFactory({ accountId, returnUrl }, logger);
            const authorizationUrl = await connectionManager.getAuthorizationUrl();

            res.redirect(authorizationUrl, next);
        } else {
            const accounts: IAccount[] = JSON.parse(fromBase64(accountsQueryString.toString()));
            const nonce = crypto.randomBytes(16).toString('base64');
            const body = this.getAccountSelectorHtml(accounts, returnUrl, nonce);

            res.writeHead(200, {
                'content-length': Buffer.byteLength(body),
                'content-type': 'text/html',
                'strict-transport-security': 'max-age=63072000; includeSubdomains; preload',
                'content-security-policy': `default-src 'none'; img-src 'self'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'`,
                'x-content-type-options': 'nosniff',
                'x-xss-protection': '1; mode=block',
                'referrer-policy': 'same-origin',
                'x-permitted-cross-domain-policies': 'none',
                'x-frame-options': 'DENY',
            });

            res.write(body);
            res.end();
        }

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
        if (!url.searchParams.has('account')) {
            url.searchParams.append('account', accountId);
        }

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
        try {
            const accessToken = await connectionManager.getAccessToken();
            const connectionStatus: IConnectionStatus = {
                isAlive: accessToken !== undefined,
            };

            res.send(200, connectionStatus);
        } catch (err) {
            if (err instanceof TravelPerk.UnauthorizedError) {
                const result: IConnectionStatus = {
                    isAlive: false,
                    message: ConnectionMessage.DisconnectedRemotely,
                };

                res.send(200, result);
            } else {
                logger.error(err);

                const result: IConnectionStatus = {
                    isAlive: false,
                };

                res.send(200, result);
            }
        }
    }

    private getAccountSelectorHtml(accounts: IAccount[], returnUrl: string, nonce: string) {
        // cspell: disable
        const body = `
            <html>
                <head>
                    <title>Payhawk</title>
                    <meta http-equiv="Pragma" content="no-cache" />
                    <meta http-equiv="Expires" content="-1″ />
                    <meta http-equiv="CACHE-CONTROL" content="NO-CACHE" />

                    <style nonce="${nonce}">
                        html {
                            font-family: "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif;
                            font-size: 14px;
                        }

                        .phwk-tp-connect-page {
                            background-color: #f4f5f6;
                        }

                        .phwk-container {
                            width: fit-content;

                            margin-top: 12rem;
                            margin-left: auto;
                            margin-right: auto;
                        }

                        .account-selector-form {
                            border: 1px solid rgb(222, 226, 230);
                            background-color: white;
                            margin-top: 2rem;
                            padding: 2rem 4rem;
                        }

                        .form-group > label {
                            color: #9097a0;
                        }

                        button.btn-connect {
                            font-weight: 500;
                            background-color: #4189FF;
                            border-color: #4189FF;
                            border-radius: 17.5px;
                        }

                        button.btn-connect:hover {
                            background-color: #1B71FF;
                            border-color: #1B71FF;
                        }

                        img.phwk-logo {
                           display: block;
                           margin: auto;
                        }
                    </style>
                    <script
                        nonce="${nonce}"
                        src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
                        integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs="
                        crossorigin="anonymous">
                    </script>
                    <link
                        nonce="${nonce}"
                        rel="stylesheet"
                        href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
                        integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z"
                        crossorigin="anonymous"
                    >
                    <script
                        nonce="${nonce}"
                        src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"
                        integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV"
                        crossorigin="anonymous">
                    </script>
                </head>
                <body class="phwk-tp-connect-page">
                    <div class="phwk-container">
                        <img class="phwk-logo" src="/images/logo.png" />
                        <form action="/connect?returnUrl=${encodeURIComponent(returnUrl)}" method="GET" class="account-selector-form">
                            <div class="form-group">
                                <label for="accountSelector">Select an account</label>
                                <select class="form-control" name="accountId" id="accountSelector">
                                    ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`)}
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="hidden" name="returnUrl" value="${returnUrl}" />
                            </div>
                            <button type="submit" class="btn btn-primary mt-3 btn-connect">Connect</button>
                        </form>
                    </div>
                </body>
            </html>
        `;
        // cspell: enable

        return body;
    }
}
