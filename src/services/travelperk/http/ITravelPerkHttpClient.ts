/**
 * An interface for a TravelPerk client wrapper that enables making TravelPerk API calls
 */
export interface ITravelPerkHttpClient {
    /**
     * Builds URL for user login and consent, and returns it
     */
    buildConsentUrl(): string;

    /**
     * Exchanges temporary auth code with access token / refresh token pair
     * @param code Authorization code
     */
    getAccessToken(code: string): Promise<any>;

    /**
     * Uses current refresh token to exchange expired access token new with access token / refresh token pair
     */
    refreshAccessToken(): Promise<any>;

    /**
     * Makes a raw request against the TravelPerk API on the provided path, with error handling
     * @param requestOptions Request options such as the HTTP method, API path and headers of the request
     */
    makeRequest<TResult extends any>(requestOptions: IRequestOptions): Promise<TResult>;
}

export interface IRequestOptions {
    method: 'GET' | 'PUT' | 'POST' | 'DELETE';
    path?: string;
    fullPath?: string;
    data?: any;
}
