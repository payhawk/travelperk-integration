import * as fs from 'fs';

export interface IConfig {
    serviceName: string;
    payhawkUrl: string;
}

let serviceConfigPath = process.env.CONFIG_PATH ? `${process.env.CONFIG_PATH}/travelperk-adapter-config.json` : '../../config.json';
if (process.env.TELEPRESENCE_MOUNT_PATH) {
    serviceConfigPath = process.env.TELEPRESENCE_MOUNT_PATH + serviceConfigPath;
}

export const config: IConfig = {
    serviceName: 'TravelPerk Integration',
    // tslint:disable-next-line: no-var-requires
    ...(fs.existsSync(serviceConfigPath) ? require(serviceConfigPath) : {}),
};
