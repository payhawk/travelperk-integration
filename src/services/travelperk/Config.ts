import * as fs from 'fs';

import { toBase64 } from '@utils';

export interface ITravelPerkClientConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    state: string;
}

const travelPerkConfigPath = getTravelPerkConfigPath();

const config: ITravelPerkClientConfig = {
    // tslint:disable-next-line: no-var-requires
    ...(fs.existsSync(travelPerkConfigPath) ? require(travelPerkConfigPath) : {}),
};

export const getTravelPerkConfig = (accountId: string, returnUrl?: string): ITravelPerkClientConfig => {
    const queryString = `accountId=${encodeURIComponent(accountId)}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
    return {
        ...config,
        state: toBase64(queryString),
    };
};

function getTravelPerkConfigPath(): string {
    let result = process.env.TRAVELPERK_CONFIG_PATH ? `${process.env.TRAVELPERK_CONFIG_PATH}/travelperk-config.json` : '../../../travelperk-config.json';
    if (process.env.TELEPRESENCE_MOUNT_PATH) {
        result = process.env.TELEPRESENCE_MOUNT_PATH + result;
    }

    return result;
}
