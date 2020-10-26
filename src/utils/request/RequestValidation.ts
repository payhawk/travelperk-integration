import Axios from 'axios';
import * as NodeRSA from 'node-rsa';
import { Next, Request, Response } from 'restify';
import { BadRequestError, ForbiddenError } from 'restify-errors';

import { config } from '@config';

/**
 * Returns a decorator that verifies request has required query params
 * @param params A collection of required request query param names
 */
export function requiredQueryParams<TQuery>(...params: (keyof TQuery)[]) {
    return (controller: any, requestHandlerName: string, requestHandlerDescriptor: IRequestHandlerDescriptor | undefined): any => {
        if (requestHandlerDescriptor === undefined) {
            requestHandlerDescriptor = Object.getOwnPropertyDescriptor(controller, requestHandlerName)!;
        }

        const originalMethod: any = requestHandlerDescriptor.value!;

        requestHandlerDescriptor.value = async function (this: any, request: Request, response: Response, next: Next) {
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
        };

        return requestHandlerDescriptor;
    };
}

/**
 * Returns a decorator that verifies request handler has required request body params
 * @param params A collection of required request body property names
 */
export function requiredBodyParams<TBody>(...params: (keyof TBody)[]) {
    return (controller: any, requestHandlerName: string, requestHandlerDescriptor: IRequestHandlerDescriptor | undefined): any => {
        if (requestHandlerDescriptor === undefined) {
            requestHandlerDescriptor = Object.getOwnPropertyDescriptor(controller, requestHandlerName)!;
        }

        const originalMethod: any = requestHandlerDescriptor.value!;

        requestHandlerDescriptor.value = async function (this: any, request: Request, response: Response, next: Next) {
            if (!request.body) {
                throw new BadRequestError('No request body.');
            }

            for (const param of params) {
                const value = request.body[param];
                if (value === undefined || value === null) {
                    throw new BadRequestError(`Missing required body parameter: ${param}.`);
                }
            }

            // eslint-disable-next-line prefer-rest-params
            return originalMethod.apply(this, arguments);
        } as any;

        return requestHandlerDescriptor;
    };
}

/**
 * Verifies request handler is signed and throws an error otherwise
 * @param controller Target controller
 * @param requestHandlerName Target controller method
 * @param requestHandlerDescriptor Request handler descriptor
 */
export function payhawkSigned(controller: any, requestHandlerName: string, requestHandlerDescriptor: IRequestHandlerDescriptor | undefined): any {
    if (requestHandlerDescriptor === undefined) {
        requestHandlerDescriptor = Object.getOwnPropertyDescriptor(controller, requestHandlerName)!;
    }

    const originalMethod: any = requestHandlerDescriptor.value!;

    requestHandlerDescriptor.value = async function (this: any, req: Request, response: Response, next: Next) {
        if (!process.env.TESTING) {
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
        }

        // eslint-disable-next-line prefer-rest-params
        return originalMethod.apply(this, arguments);
    };

    return requestHandlerDescriptor;
}

// a minute
const REQUEST_DELAY_TOLERANCE_MS = 60 * 1000;

type IRequestHandlerDescriptor =
    TypedPropertyDescriptor<(request: Request, response: Response) => Promise<void>> |
    TypedPropertyDescriptor<(request: Request, response: Response, next: Next) => Promise<void>>;
