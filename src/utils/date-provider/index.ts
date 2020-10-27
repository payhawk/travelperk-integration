import { IDateProvider } from './IDateProvider';
import { MomentDateProvider } from './MomentDateProvider';

export * from './IDateProvider';

export type IDateProviderFactory = () => IDateProvider;

export const createDateProvider: IDateProviderFactory = () => new MomentDateProvider();
