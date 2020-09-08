import { TravelPerk } from '@services';
import { ILogger } from '@utils';

import { IInvoice } from './contracts';
import { IManager } from './contracts/IManager';

export class Manager implements IManager {
    constructor(
        private readonly client: TravelPerk.IClient,
        // @ts-ignore
        private readonly logger: ILogger,
    ) {}

    async getInvoices(): Promise<IInvoice[]> {
        const result = await this.client.getInvoices();
        return result.map(mapToInvoice);
    }
}

function mapToInvoice({ serial_number, status, profile_id, profile_name, currency, total, pdf, due_date, issuing_date }: TravelPerk.IInvoice): IInvoice {
    return {
        serialNumber: serial_number,
        status,
        profileId: profile_id,
        profileName: profile_name,
        currency,
        total,
        pdf,
        dueDate: due_date,
        issuingDate: issuing_date,
    };
}
