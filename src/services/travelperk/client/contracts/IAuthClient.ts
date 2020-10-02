import { ITokenSet } from '@store';

/**
 * An interface for a TravelPerk auth client wrapper
 */

export interface IAuthClient {
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

    /**
     * Revokes access token / refresh token pair so that they can no longer be used
     * @param currentToken Token set that will be revoked
     */
    revokeAccessToken(currentToken: IAccessToken): Promise<void>;
}

export interface IAccessToken extends Required<ITokenSet> {
    expired(): boolean;
}
