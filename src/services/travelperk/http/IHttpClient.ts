export interface IHttpClient {
    request<TBody = any>(requestOptions: IRequestOptions): Promise<TBody>;
}

export interface IRequestOptions {
    method: 'GET' | 'PUT' | 'POST' | 'DELETE';
    url?: string;
    data?: any;
    contentType?: string;
    responseType?: 'json' | 'arraybuffer';
}
