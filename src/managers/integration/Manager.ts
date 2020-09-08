import { Payhawk } from '@services';
import { ILogger } from '@utils';

import * as Entities from '../entities';
import { IManager } from './IManager';

export class Manager implements IManager {
    constructor(
        // @ts-ignore
        private readonly payhawkClient: Payhawk.IClient,
        private readonly travelperkEntities: Entities.IManager,
        // @ts-ignore
        private readonly logger: ILogger,
    ){}

    async syncInvoices(): Promise<void> {
        const invoices = await this.travelperkEntities.getInvoices();
        if (invoices) {
            return;
        }
    }

}
