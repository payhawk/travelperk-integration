import { IAuthClient, IClient, IInvoicesClient } from './contracts';

export class Client implements IClient {
    constructor(
        readonly auth: IAuthClient,
        readonly invoices: IInvoicesClient,
    ) {
    }
}
