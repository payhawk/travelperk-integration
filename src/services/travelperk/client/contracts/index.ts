export * from './IAuthClient';
export * from './IInvoicesClient';
export * from './IClient';
export * from './IInvoice';

export type IQuery = { [key: string]: any };

export function toUrlParams(query?: IQuery): string {
    const queryString = query ? Object.keys(query)
        .filter(x => query[x] !== undefined)
        .map(x => `${x}=${encodeURIComponent(query[x].toString())}`).join('&') :
        '';
    return queryString;
}

export function buildUrl(basePath: string, path: string, query?: IQuery): string {
    const queryString = toUrlParams(query);
    return `${basePath}${path}?${queryString}`;
}

export function buildApiUrl(path: string, query?: IQuery): string {
    return buildUrl(API_BASE_PATH, path, query);
}

const API_BASE_PATH = 'https://api.travelperk.com';
