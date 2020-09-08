export interface IManager {
    getConnectedAccountIds(): Promise<string[]>;
}
