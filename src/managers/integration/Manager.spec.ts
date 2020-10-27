import { It, Mock, Times } from 'typemoq';

import { Payhawk } from '@services';
import { IDateProvider, ILogger } from '@utils';

import * as Entities from '../entities';
import { Manager } from './Manager';

describe('Integration manager', () => {
    const clientMock = Mock.ofType<Payhawk.IClient>();
    const entitiesManagerMock = Mock.ofType<Entities.IManager>();
    const dateProviderMock = Mock.ofType<IDateProvider>();
    const loggerMock = Mock.ofType<ILogger>();

    const manager = new Manager(clientMock.object, entitiesManagerMock.object, dateProviderMock.object, loggerMock.object);

    beforeEach(() => {
        loggerMock
            .setup(l => l.child(It.isAny()))
            .returns(() => loggerMock.object);
    });

    afterEach(() => {
        [
            clientMock,
            entitiesManagerMock,
            dateProviderMock,
            loggerMock,
        ].forEach(m => {
            m.verifyAll();
            m.reset();
        });
    });

    it('should get invoices since last successful sync', async () => {
        const lastSyncedAt = new Date(Date.UTC(2020, 9, 10, 3, 0, 0));
        const newSyncedAt = new Date(Date.UTC(2020, 9, 10, 5, 0, 0));

        dateProviderMock
            .setup(d => d.utcNow())
            .returns(() => newSyncedAt)
            .verifiable(Times.once());

        const invoice: Partial<Entities.IInvoice> = {
            serialNumber: '0001',
            taxesSummary: [],
        };

        entitiesManagerMock
            .setup(e => e.getLastInvoicesSync())
            .returns(async () => lastSyncedAt)
            .verifiable(Times.once());

        entitiesManagerMock
            .setup(e => e.getPaidInvoices(lastSyncedAt))
            .returns(async () => [invoice as Entities.IInvoice])
            .verifiable(Times.once());

        entitiesManagerMock
            .setup(e => e.getInvoiceDocument(invoice.serialNumber!))
            .returns(async () => new ArrayBuffer(0))
            .verifiable(Times.once());

        entitiesManagerMock
            .setup(e => e.getInvoiceLines(invoice.serialNumber!))
            .returns(async () => [])
            .verifiable(Times.once());

        await manager.syncInvoices();
    });
});
