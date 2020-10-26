import { Pool } from 'pg';
import { It, Mock } from 'typemoq';

import { ILogger } from '../utils';
import { PgStore } from './PgStore';

describe('PgStore', () => {
    const dbClientMock = Mock.ofType<Pool>();
    const loggerMock = Mock.ofType<ILogger>();

    const store = new PgStore(dbClientMock.object, loggerMock.object);

    afterEach(() => {
        [
            dbClientMock,
            loggerMock,
        ].forEach(m => {
            m.verifyAll();
            m.reset();
        });
    });

    it('should match snapshot for getting all tokens', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.getAllTokenSets();
    });

    it('should match snapshot for getting api key', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.getApiKey('acc_id');
    });

    it('should match snapshot for setting api key', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.setApiKey('acc_id', 'key');
    });

    it('should match snapshot for saving access token', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.saveAccessToken({
            account_id: 'acc_id',
            token_set: { access_token: 'a', refresh_token: 'r', scope: 's', token_type: 'Bearer' },
        });
    });

    it('should match snapshot for deleting access token', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.deleteAccessToken('acc_id');
    });

    it('should match snapshot for getting access token for account', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.getAccessToken('acc_id');
    });

    it('should match snapshot for getting last sync date for account', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.getLastSyncDate('acc_id');
    });

    it('should match snapshot for getting last sync date for account', async () => {
        dbClientMock
            .setup(d => d.query(It.isAny()))
            .callback(req => expect(req).toMatchSnapshot())
            .returns(async () => ({ rows: [], rowCount: 0 }));

        await store.updateLastSyncDate('acc_id', new Date(Date.UTC(2020, 1, 2)));
    });
});
