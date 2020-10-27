import { utc } from 'moment';

import { IDateProvider } from './IDateProvider';

export class MomentDateProvider implements IDateProvider {
    utcNow(): Date {
        return utc().toDate();
    }
}
