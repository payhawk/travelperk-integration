import * as moment from 'moment';

export const toShortDateFormat = (date: moment.Moment | Date | string): string => {
    return moment.utc(date).format('YYYY-MM-DD');
};

export const toShortDate = (date: moment.Moment | Date | string): Date => {
    return moment.utc(date).hours(0).minutes(0).seconds(0).toDate();
};
