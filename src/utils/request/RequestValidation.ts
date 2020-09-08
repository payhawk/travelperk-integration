import Axios from 'axios';
import * as NodeRSA from 'node-rsa';
import { Next, Request, Response } from 'restify';
import { BadRequestError, ForbiddenError } from 'restify-errors';

import { config } from '@config';

export function requiredQueryParams<TQuery>(...params: (keyof TQuery)[]) {
    // tslint:disable-next-line:only-arrow-functions
    return function (target: any, key: string, descriptor: TypedPropertyDescriptor<(request: Request, response: Response) => Promise<void>> | TypedPropertyDescriptor<(request: Request, response: Response, next: Next) => Promise<void>>): any {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key)!;
        }

        const originalMethod: any = descriptor.value!;

        // tslint:disable-next-line:space-before-function-paren
        descriptor.value = async function (this: any, request: Request, response: Response, next: Next) {
            if (!request.query) {
                throw new BadRequestError('No query parameters provided.');
            }

            for (const param of params) {
                const value = request.query[param];
                if (value === undefined || value === null) {
                    throw new BadRequestError(`Missing required query parameter: ${param}.`);
                }
            }

            // eslint-disable-next-line prefer-rest-params
            return originalMethod.apply(this, arguments);
        } as any;

        return descriptor;
    };
}

// a minute
const REQUEST_DELAY_TOLERANCE_MS = 60 * 1000;

export function payhawkSigned(target: any, key: string, descriptor: TypedPropertyDescriptor<(request: Request, response: Response) => Promise<void>> | TypedPropertyDescriptor<(request: Request, response: Response, next: Next) => Promise<void>>): any {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key)!;
    }

    if (process.env.TESTING) {
        return descriptor.value;
    }

    const originalMethod: any = descriptor.value!;

    descriptor.value = async function (this: any, req: Request, response: Response, next: Next) {
        const timestampString = req.headers['x-payhawk-timestamp'];
        if (!timestampString || typeof timestampString !== 'string') {
            throw new ForbiddenError();
        }

        const timestamp = new Date(timestampString);
        if (new Date().getTime() - timestamp.getTime() > REQUEST_DELAY_TOLERANCE_MS) {
            throw new ForbiddenError();
        }

        const signature = req.headers['x-payhawk-signature'];
        if (!signature || typeof signature !== 'string') {
            throw new ForbiddenError();
        }

        const publicKeyResponse = await Axios.get<string>(`${config.payhawkUrl}/api/v2/rsa-public-key`);
        const publicKey = publicKeyResponse.data;

        const rsaKey = new NodeRSA(publicKey);
        const queryString = req.getQuery();
        const urlToSign = `${req.path()}${queryString ? `?${queryString}` : ''}`;
        const dataToSign = `${timestampString}:${urlToSign}:${req.body ? JSON.stringify(req.body) : ''}`;
        rsaKey.verify(Buffer.from(dataToSign), signature, 'buffer', 'base64');

        // eslint-disable-next-line prefer-rest-params
        return originalMethod.apply(this, arguments);
    };

    return descriptor;
}
