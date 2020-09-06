import axios from 'axios';
import { PermissionsCacheHolder, PermissionsServiceWrapper } from '../src';
import * as allPermissionsTrue from './responses/allPermissionsTrue.json';
import * as allPermissionsTrue2 from './responses/allPermissionsTrue2.json';
import * as emptyUserPermissions from './responses/emptyUserPermissions.json';
import * as testPermissionsUpdateFalse from './responses/testPermissionsUpdateFalse.json';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
let permissionsServiceWrapper: PermissionsServiceWrapper;

beforeEach(() => {
    const permissionsCacheHolder = new PermissionsCacheHolder();
    permissionsServiceWrapper = new PermissionsServiceWrapper(
        'someservice',
        { info: jest.fn() } as any,
        permissionsCacheHolder,
    );
});

describe('get permissions result', () => {
    describe('result permitted is true', () => {
        it('single type and action permitted', async () => {
            mockedAxios.get.mockResolvedValue({ data: allPermissionsTrue, status: 200 });
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ'],
            );
            expect(result.isPermitted).toBeTruthy();
        });

        it('single type and multiple actions permitted', async () => {
            mockedAxios.get.mockResolvedValue({ data: allPermissionsTrue, status: 200 });
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ', 'UPDATE'],
            );
            expect(result.isPermitted).toBeTruthy();
        });

        it('multiple types and single action permitted', async () => {
            mockedAxios.get
                .mockImplementationOnce(
                    (url, config) => ({ data: allPermissionsTrue, status: 200 } as any),
                )
                .mockImplementationOnce(
                    (url, config) => ({ data: allPermissionsTrue2, status: 200 } as any),
                );
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST', 'Arik'],
                ['READ'],
            );
            expect(result.isPermitted).toBeTruthy();
        });

        it('multiple types and actions permitted', async () => {
            mockedAxios.get
                .mockImplementationOnce(
                    (url, config) => ({ data: allPermissionsTrue, status: 200 } as any),
                )
                .mockImplementationOnce(
                    (url, config) => ({ data: allPermissionsTrue2, status: 200 } as any),
                );
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST', 'Arik'],
                ['READ', 'UPDATE'],
            );
            expect(result.isPermitted).toBeTruthy();
        });
    });

    describe('result permitted is false', () => {
        it('action is not permitted', async () => {
            mockedAxios.get.mockResolvedValue({ data: testPermissionsUpdateFalse, status: 200 });
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['Test'],
                ['READ', 'UPDATE'],
            );
            expect(result.isPermitted).toBeFalsy();
        });

        it('action is not included in result', async () => {
            mockedAxios.get.mockResolvedValue({ data: allPermissionsTrue, status: 200 });
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ', 'NOSUCHACTION'],
            );
            expect(result.isPermitted).toBeFalsy();
        });

        it('types is empty', async () => {
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                [],
                ['READ'],
            );
            expect(result.isPermitted).toBeFalsy();
        });

        it('actions is empty', async () => {
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['Test'],
                [],
            );
            expect(result.isPermitted).toBeFalsy();
        });

        it('empty response format', async () => {
            mockedAxios.get.mockResolvedValue({ data: emptyUserPermissions, status: 200 });
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ', 'NOSUCHACTION'],
            );
            expect(result.isPermitted).toBeFalsy();
        });
    });

    describe('error handling', () => {
        it('should throw exception when status code is not 200', async () => {
            mockedAxios.get.mockResolvedValue({ data: allPermissionsTrue, status: 400 });
            const action = async () =>
                permissionsServiceWrapper.getPermissionResult(
                    'arikUpn',
                    'TheReal',
                    ['TEST'],
                    ['READ', 'NOSUCHACTION'],
                );
            await expect(action).rejects.toEqual(
                new Error(
                    'Status response 400 is received when access external permissions service',
                ),
            );
        });

        it('error while sending request', async () => {
            mockedAxios.get.mockImplementationOnce((url, config) => {
                throw new Error('Something wong');
            });
            const action = async () =>
                permissionsServiceWrapper.getPermissionResult(
                    'arikUpn',
                    'TheReal',
                    ['TEST'],
                    ['READ', 'NOSUCHACTION'],
                );
            await expect(action).rejects.toEqual(new Error('Something wong'));
        });
    });

    describe('http headers', () => {
        it('should be returned from the external service', async () => {
            mockedAxios.get.mockResolvedValue({
                data: allPermissionsTrue,
                status: 200,
                headers: { arik: 'test' },
            });
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ'],
            );
            expect(result.responseHeaders!.arik).toBe('test');
        });
    });

    describe('cached permissions', () => {
        it('should use the cache for the second time', async () => {
            mockedAxios.get.mockImplementationOnce(
                () => ({ data: allPermissionsTrue, status: 200 } as any),
            );
            await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ'],
            );
            const result = await permissionsServiceWrapper.getPermissionResult(
                'arikUpn',
                'TheReal',
                ['TEST'],
                ['READ'],
            );
            expect(result.isPermitted).toBeTruthy();
            expect(mockedAxios.get).toBeCalledTimes(1);
        });
    });
});
