import { boundMethod } from 'autobind-decorator';
import { Request, Response } from 'restify';

import { Accounts, Connection, Integration } from '@managers';
import { ILogger, payhawkSigned } from '@utils';

import { IPayhawkPayload, PayhawkEvent } from './contracts';

export class IntegrationController {
    constructor(
        private readonly accountsManagerFactory: Accounts.IManagerFactory,
        private readonly connectionManagerFactory: Connection.IManagerFactory,
        private readonly integrationManagerFactory: Integration.IManagerFactory,
        private readonly baseLogger: ILogger,
    ) { }

    @boundMethod
    async syncInvoices(req: Request, res: Response) {
        this.baseLogger.info('Invoices sync received');

        const accountsManager = this.accountsManagerFactory(this.baseLogger);
        const connectedAccountIds = await accountsManager.getConnectedAccountIds();
        if (connectedAccountIds.length === 0) {
            this.baseLogger.info('No connected accounts found');
        } else {
            for (const accountId of connectedAccountIds) {
                const logger = this.baseLogger.child({ accountId });

                logger.info('Processing started');

                const connectionManager = this.connectionManagerFactory({ accountId }, logger);
                const accessToken = await connectionManager.getAccessToken();
                if (!accessToken) {
                    logger.error(Error('Could not retrieve valid access token'));
                    continue;
                }

                const payhawkApiKey = await connectionManager.getPayhawkApiKey();

                const integrationManager = this.integrationManagerFactory(
                    {
                        accountId,
                        payhawkApiKey,
                        accessToken,
                    },
                    logger,
                );

                await integrationManager.syncInvoices();

                logger.info('Processing completed');
            }
        }

        res.send(204);

        this.baseLogger.info('Invoices sync processed');
    }

    @boundMethod
    @payhawkSigned
    async payhawk(req: Request, res: Response) {
        const payload = req.body as IPayhawkPayload;
        const { accountId, event, data } = payload;

        const logger = this.baseLogger.child({ accountId, event }, req);

        const connectionManager = this.connectionManagerFactory({ accountId }, logger);

        try {
            switch (event) {
                case PayhawkEvent.ApiKeySet:
                    logger.info('New API key received');
                    if (!data.apiKey) {
                        logger.error(Error('API key is required in payload data'));
                        res.send(500);
                        return;
                    }

                    await connectionManager.setPayhawkApiKey(data.apiKey);
                    res.send(204);
                    return;

                default:
                    res.send(400, 'Unknown event');
                    return;
            }
        } catch (err) {
            logger.error(err);
            res.send(500);
        }

        return;
    }
}
