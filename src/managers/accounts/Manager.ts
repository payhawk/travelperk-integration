import { IStore } from '@store';
import { ILogger } from '@utils';

import { IManager } from './contracts';

export class Manager implements IManager {
    constructor(
        private readonly store: IStore,
        // @ts-ignore
        private readonly logger: ILogger,
    ) { }

    async getConnectedAccountIds(): Promise<string[]> {
        const records = await this.store.getAllTokenSets();
        return records.map(r => r.account_id);
    }
}
