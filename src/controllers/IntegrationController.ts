import { boundMethod } from 'autobind-decorator';
import { Request, Response } from 'restify';

import { Accounts, Connection, Integration } from '@managers';
import { TravelPerk } from '@services';
import { ILogger, payhawkSigned, requiredBodyParams } from '@utils';

import { IPayhawkPayload, ISyncInvoicesPayload, PayhawkEvent } from './contracts';

export class IntegrationController {
    constructor(
        private readonly accountsManagerFactory: Accounts.IManagerFactory,
        private readonly connectionManagerFactory: Connection.IManagerFactory,
        private readonly integrationManagerFactory: Integration.IManagerFactory,
        private readonly baseLogger: ILogger,
    ) { }

    @boundMethod
    @requiredBodyParams<ISyncInvoicesPayload>('fromBeforeMinutes')
    async syncInvoices(req: Request, res: Response) {
        const { fromBeforeMinutes } = req.body as ISyncInvoicesPayload;

        let logger = this.baseLogger.child({ fromBeforeMinutes });
        logger.info('Invoices sync received');

        const accountsManager = this.accountsManagerFactory(logger);
        const connectedAccountIds = await accountsManager.getConnectedAccountIds();
        if (connectedAccountIds.length === 0) {
            logger.info('No connected accounts found');
        } else {
            for (const accountId of connectedAccountIds) {
                try {
                    logger = logger.child({ accountId });

                    await this.syncInvoicesForAccount(accountId, fromBeforeMinutes, logger);
                } catch (err) {
                    if (err instanceof TravelPerk.UnauthorizedError) {
                        logger.info('Disconnected remotely. Must re-authenticate');
                        continue;
                    }

                    throw err;
                }
            }
        }

        res.send(204);

        logger.info('Invoices sync processed');
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
                case PayhawkEvent.Disconnect:
                    logger.info('Disconnect received');

                    await connectionManager.disconnect();

                    logger.info('Disconnect processed');
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

    private async syncInvoicesForAccount(accountId: string, fromBeforeMinutes: number, logger: ILogger): Promise<void> {
        logger.info('Processing started');

        const connectionManager = this.connectionManagerFactory({ accountId }, logger);
        const accessToken = await connectionManager.getAccessToken();
        if (!accessToken) {
            logger.error(Error('Could not retrieve valid access token'));
            return;
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

        await integrationManager.syncInvoices(fromBeforeMinutes);

        logger.info('Processing completed');
    }
}
