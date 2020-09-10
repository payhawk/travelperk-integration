export interface IManager {
    syncInvoices(fromBeforeMinutes: number): Promise<void>;
}
