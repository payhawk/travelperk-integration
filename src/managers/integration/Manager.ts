import { Payhawk } from '@services';
import { ILogger } from '@utils';

import * as Entities from '../entities';
import { IManager } from './IManager';

export class Manager implements IManager {
    constructor(
        private readonly payhawkClient: Payhawk.IClient,
        private readonly travelperkEntities: Entities.IManager,
        private readonly logger: ILogger,
    ) { }

    async syncInvoices(): Promise<void> {
        const invoices = await this.travelperkEntities.getPaidInvoicesSinceLastSync();
        for (const invoice of invoices) {
            const invoiceLogger = this.logger.child({ invoiceSerialNumber: invoice.serialNumber });

            const document = await this.travelperkEntities.getInvoiceDocument(invoice.serialNumber);

            invoiceLogger.info('Uploading started');

            await this.payhawkClient.uploadDocument(document, invoice.total, invoice.currency, invoice.issuingDate);

            invoiceLogger.info('Uploading completed');
        }
    }

}
