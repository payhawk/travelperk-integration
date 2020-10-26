export interface IConnectionStatus {
    isAlive: boolean;
    message?: ConnectionMessage;
}

export enum ConnectionMessage {
    DisconnectedRemotely = 'disconnected_remotely',
}
