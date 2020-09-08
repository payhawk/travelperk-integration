import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ForbiddenError } from 'restify-errors';

import { ILogger } from '@utils';

import { IHttpClient, IRequestOptions } from './IHttpClient';

export class HttpClient implements IHttpClient {
    private readonly client: AxiosInstance;

    constructor(
        private readonly accessToken: string | undefined,
        private readonly logger: ILogger,
    ) {
        this.client = Axios.create();
        this.client.interceptors.request.use(async (reqConfig: AxiosRequestConfig) => {
            if (this.accessToken) {
                reqConfig.headers[AUTHORIZATION_HEADER] = `Bearer ${this.accessToken}`;
            }

            reqConfig.headers[API_VERSION_HEADER] = API_VERSION;
            return reqConfig;
        });
    }

    async request<TBody = any>(requestOptions: IRequestOptions): Promise<TBody> {
        return this.makeRequest<TBody>(requestOptions);
    }
    private async makeRequest<TBody extends any>({ method, url, data, contentType, responseType }: IRequestOptions): Promise<TBody> {
        return this._makeSafeRequest<TBody>(
            async () => {
                const headers: Record<string, string> = {};
                if (contentType) {
                    headers[CONTENT_TYPE_HEADER] = contentType;
                }

                const response = await this.client.request<TBody>({
                    url,
                    method,
                    data,
                    headers,
                    responseType,
                });

                return response.data;
            }
            ,
            0,
        );
    }

    private async _makeSafeRequest<TResult extends any>(action: () => Promise<any>, retryCount: number): Promise<TResult> {
        if (retryCount === MAX_RETRIES) {
            throw Error(`Already retried ${MAX_RETRIES} times after rate limit exceeded.`);
        }

        let actionResult;

        try {
            actionResult = await action();
        } catch (err) {
            actionResult = await this._handleFailedRequest(err, action, retryCount);
            if (!actionResult) {
                return undefined as any;
            }
        }

        return actionResult;
    }

    private async _handleFailedRequest<TResult>(err: AxiosError, action: () => Promise<any>, retryCount: number): Promise<TResult> {
        const logger = this.logger.child({ action: action.toString() });

        if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
                case 403:
                    const errBody = { name: err.name, message: err.message };
                    throw createError(action, errBody, m => new ForbiddenError(m));
                case 404:
                    return undefined as any;
                case 429:
                    const headers = err.response.headers;
                    const retryAfterHeaderValue = headers['retry-after'];
                    const secondsToRetryAfter = Number(retryAfterHeaderValue) || DEFAULT_SECONDS_TO_RETRY_AFTER;
                    if (secondsToRetryAfter <= 0) {
                        throw Error(`Invalid 'Retry-After' header: '${retryAfterHeaderValue}'`);
                    }

                    const millisecondsToRetryAfter = secondsToRetryAfter * 1000;
                    const nextRetryCount = retryCount + 1;

                    logger.info(`Rate limit exceeded. Retrying again after ${secondsToRetryAfter} seconds (${nextRetryCount})`);

                    return new Promise((resolve, reject) => {
                        const handledRetry = () =>
                            this._makeSafeRequest<TResult>(action, nextRetryCount)
                                .then(d => resolve(d))
                                .catch(e => reject(e));

                        setTimeout(handledRetry, millisecondsToRetryAfter);
                    });
                case 400:
                default:
                    throw createError(action, err);
            }
        }

        throw createError(action, err);
    }
}

function createError(action: any, err: any, errorConstructor: (m?: string) => Error = Error): Error {
    return errorConstructor(JSON.stringify({ action: action.toString(), error: err }, undefined, 2));
}

const AUTHORIZATION_HEADER = 'Authorization';
const CONTENT_TYPE_HEADER = 'Content-Type';
const API_VERSION_HEADER = 'Api-Version';
const API_VERSION = '1';

const MAX_RETRIES = 3;
const DEFAULT_SECONDS_TO_RETRY_AFTER = 1;
