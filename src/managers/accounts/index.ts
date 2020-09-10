import { createStore } from '@store';
import { ILogger } from '@utils';

import { IManager } from './contracts';
import { Manager } from './Manager';

export * from './contracts';

export type IManagerFactory = (logger: ILogger) => IManager;

export const createManager: IManagerFactory = (logger: ILogger) => new Manager(createStore(logger), logger);
