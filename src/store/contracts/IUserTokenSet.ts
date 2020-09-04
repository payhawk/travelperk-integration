import { TokenSet } from 'openid-client';

import { KeyNameMap } from '@utils';

export interface INewUserTokenSetRecord {
    account_id: string;
    token_set: ITokenSet;
}

export type ITokenSet = TokenSet;

export interface IUserTokenSetRecord extends INewUserTokenSetRecord {
    created_at: Date;
    updated_at: Date;
}

export const UserTokenSetRecordKeys: KeyNameMap<IUserTokenSetRecord> = {
    created_at: 'created_at',
    token_set: 'token_set',
    updated_at: 'updated_at',
    account_id: 'account_id',
};
