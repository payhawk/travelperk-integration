import { TravelPerk } from '@services';

export interface IManager {
    getAuthorizationUrl(): Promise<string>;
    authenticate(verifier: string): Promise<TravelPerk.IAccessToken>;
    getAccessToken(): Promise<TravelPerk.IAccessToken | undefined>;
    isAccessTokenExpired(accessToken: TravelPerk.IAccessToken): boolean;
    disconnect(): Promise<void>;

    getPayhawkApiKey(): Promise<string>;
    setPayhawkApiKey(apiKey: string): Promise<void>;
}
