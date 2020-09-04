import { ILogger } from '@utils';

import { ITravelPerkHttpClient } from '../http';
import { IClient } from './contracts';

export class Client implements IClient {
    constructor(
        // @ts-ignore
        private readonly client: ITravelPerkHttpClient,
        // @ts-ignore
        private readonly logger: ILogger,
    ) {
    }

}