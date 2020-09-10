import { ILogger } from '@utils';

import { HttpClient } from './HttpClient';

export * from './IHttpClient';

export const createHttpClient = (accessToken: string | undefined, logger: ILogger) => new HttpClient(accessToken, logger);
