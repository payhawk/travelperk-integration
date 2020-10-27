import { Payhawk } from '@services';
import { IDateProvider, ILogger } from '@utils';

import * as Entities from '../entities';
import { IManager } from './IManager';

export class Manager implements IManager {
    constructor(
        private readonly payhawkClient: Payhawk.IClient,
        private readonly travelperkEntities: Entities.IManager,
        private readonly dateProvider: IDateProvider,
        private readonly logger: ILogger,
    ) { }

    async syncInvoices(): Promise<void> {
        const lastSyncedAt = await this.travelperkEntities.getLastInvoicesSync();
        const invoices = await this.travelperkEntities.getPaidInvoices(lastSyncedAt);

        const newSyncedAt = this.dateProvider.utcNow();

        for (const invoice of invoices) {
            const invoiceLogger = this.logger.child({ invoiceSerialNumber: invoice.serialNumber });

            const fileContents = await this.travelperkEntities.getInvoiceDocument(invoice.serialNumber);
            const invoiceLines = await this.travelperkEntities.getInvoiceLines(invoice.serialNumber);
            const document = mapInvoiceToDocument(fileContents, invoice, invoiceLines);

            invoiceLogger.info('Uploading started');

            await this.payhawkClient.uploadDocument(document);

            invoiceLogger.info('Uploading completed');
        }

        await this.travelperkEntities.updateLastInvoicesSync(newSyncedAt);
    }
}

function mapInvoiceToDocument(fileContents: ArrayBuffer, invoice: Entities.IInvoice, invoiceLines: Entities.IInvoiceLine[]): Payhawk.IDocument {
    return {
        id: invoice.serialNumber,
        name: `${invoice.serialNumber}.pdf`,
        content: fileContents,
        contentType: 'application/pdf',
        paidDate: invoice.issuingDate,
        documentDate: invoice.issuingDate,
        documentNumber: invoice.serialNumber,
        currency: invoice.currency,
        totalAmount: invoice.total,
        taxAmount: invoice.taxesSummary.map(x => x.taxAmount).reduce((a, b) => (a + b), 0),
        serializedLineItems: JSON.stringify(invoiceLines),
    };
}
