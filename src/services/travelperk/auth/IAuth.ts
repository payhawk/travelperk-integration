import { IAccessToken } from '../client';

export interface IAuth {
    getAuthUrl(): Promise<string>;
    getAccessToken(verifier: string): Promise<IAccessToken>;
    refreshAccessToken(currentToken: IAccessToken): Promise<IAccessToken>;
}
