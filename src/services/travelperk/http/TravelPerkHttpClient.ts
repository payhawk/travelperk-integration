import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ForbiddenError } from 'restify-errors';

import { ILogger } from '@utils';

import { ITravelPerkClientConfig } from '../Config';
import { IRequestOptions, ITravelPerkHttpClient } from './ITravelPerkHttpClient';

export class TravelPerkHttpClient implements ITravelPerkHttpClient {
    private readonly client: AxiosInstance;
    constructor(
        private readonly accessToken: string | undefined,
        private readonly config: ITravelPerkClientConfig,
        private readonly logger: ILogger,
    ) {
        this.client = Axios.create({ baseURL: BASE_PATH });
        this.client.interceptors.request.use(async (reqConfig: AxiosRequestConfig) => {
            if (this.accessToken) {
                reqConfig.headers[AUTHORIZATION_HEADER] = `Bearer ${this.accessToken}`;
            }

            reqConfig.headers[API_VERSION_HEADER] = API_VERSION;
            return reqConfig;
        });
    }

    buildConsentUrl(): string {
        return buildUrl(
            '/oauth/authorize',
            {
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                scope: this.config.scope,
                response_type: 'code',
                state: this.config.state,
            }
        );
    }

    async getAccessToken(code: string): Promise<any> {
        const requestUrl = buildUrl(
            '/accounts/oauth/token',
            {
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.config.redirectUri,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
            }
        );

        const result = this.makeRequest({
            method: 'POST',
            fullPath: requestUrl,
        });

        return result;
    }

    async refreshAccessToken(): Promise<any> {
        const requestUrl = buildUrl(
            '/accounts/oauth/token',
            {
                grant_type: 'refresh_token',
                refresh_token: '',
            }
        );

        const result = this.makeRequest({
            method: 'POST',
            fullPath: requestUrl,
        });

        return result;
    }

    async makeRequest<TResult extends any>(requestOptions: IRequestOptions): Promise<TResult> {
        return this._makeSafeRequest<TResult>(() => this._makeRequestInner(requestOptions), 0);
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

    private async _makeRequestInner<TResult>({ method, fullPath, path, data }: IRequestOptions): Promise<TResult> {
        if (!fullPath && !path) {
            throw Error('Must provide either path or fullPath for making a request');
        }

        const response = await this.client.request<TResult>({
            url: fullPath || `${BASE_PATH}/${path}`,
            method,
            data,
        });

        return response.data;
    }
}

function buildUrl(path: string, query: Record<string, string>): string {
    const queryString = Object.keys(query).map(x => `${x}=${encodeURIComponent(query[x])}`);
    return `${BASE_PATH}${path}?${queryString}`;
}

function createError(action: any, err: any, errorConstructor: (m?: string) => Error = Error): Error {
    return errorConstructor(JSON.stringify({ action: action.toString(), error: err }, undefined, 2));
}

const BASE_PATH = 'https://app.travelperk.com/';
const AUTHORIZATION_HEADER = 'Authorization';
const API_VERSION_HEADER = 'Api-Version';
const API_VERSION = '1';

const MAX_RETRIES = 3;
const DEFAULT_SECONDS_TO_RETRY_AFTER = 1;
