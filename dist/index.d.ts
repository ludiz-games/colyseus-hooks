import { Schema } from '@colyseus/schema';
import { Client, Room } from 'colyseus.js';

declare const colyseus: <S = Schema>(endpoint: string, schema?: new (...args: unknown[]) => S) => {
    client: Client;
    connectToColyseus: (roomName: string, options?: {}) => Promise<void>;
    disconnectFromColyseus: () => Promise<void>;
    useColyseusRoom: () => Room<S> | undefined;
    useColyseusState: {
        (): S | undefined;
        <T extends (state: S) => unknown>(selector: T): ReturnType<T> | undefined;
    };
};

declare function store<T>(value: T): {
    get: () => T;
    set: (value: T) => void;
    subscribe: (callback: () => void) => () => boolean;
};

export { colyseus, store };
