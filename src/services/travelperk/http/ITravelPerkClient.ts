import { ITokenSet } from '@store';

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
    getAccessToken(code: string): Promise<IAccessToken>;

    /**
     * Uses current refresh token to exchange expired access token new with access token / refresh token pair
     * @param currentToken Token set that will be used to obtain a refreshed token
     */
    refreshAccessToken(currentToken: IAccessToken): Promise<IAccessToken>;
}

export interface IAccessToken extends Required<ITokenSet> {
    expired(): boolean;
}
