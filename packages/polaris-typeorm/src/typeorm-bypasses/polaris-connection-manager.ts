import { ConnectionManager, ConnectionOptions, getFromContainer } from 'typeorm';
import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError';
import { ConnectionNotFoundError } from 'typeorm/error/ConnectionNotFoundError';
import { PolarisConnection } from './polaris-connection';
import { PolarisEntityManager } from './polaris-entity-manager';

/**
 * ConnectionManager is used to store and manage multiple orm typeorm-bypasses.
 * It also provides useful factory methods to simplify connection creation.
 */
export class PolarisConnectionManager extends ConnectionManager {
    /**
     * List of typeorm-bypasses registered in this connection manager.
     */
    // @ts-ignore
    public readonly connections: PolarisConnection[] = [];

    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws error if connection with the given name was not found.
     */

    // @ts-ignore
    public get(name: string = 'default'): PolarisConnection {
        const connection = this.connections.find((con) => con.name === name);
        if (!connection) {
            throw new ConnectionNotFoundError(name);
        }
        return connection;
    }
    /**
     * Creates a new connection based on the given connection options and registers it in the manager.
     * Connection won't be established, you'll need to manually call connect method to establish connection.
     */
    // @ts-ignore
    public create(
        options: ConnectionOptions,
        polarisEntityManager: PolarisEntityManager,
    ): PolarisConnection {
        // check if such connection is already registered
        const existConnection = this.connections.find(
            (con) => con.name === (options.name || 'default'),
        );
        if (existConnection) {
            // if connection is registered and its not closed then throw an error
            if (existConnection.isConnected) {
                throw new AlreadyHasActiveConnectionError(options.name || 'default');
            }
            // if its registered but closed then simply remove it from the manager
            this.connections.splice(this.connections.indexOf(existConnection), 1);
        }
        // create a new connection
        const connection = new PolarisConnection(options);
        Object.defineProperty(connection, 'manager', {
            value: polarisEntityManager || new PolarisEntityManager(connection),
        });
        Object.defineProperty(connection.manager, 'connection', {
            value: connection,
        });
        this.connections.push(connection);
        return connection;
    }
}

export function getPolarisConnectionManager() {
    return getFromContainer(PolarisConnectionManager);
}
