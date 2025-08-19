// src/colyseus.ts
import { Client } from "colyseus.js";
import { useSyncExternalStore } from "react";

// src/store.ts
function store(value) {
  let state = value;
  const subscribers = /* @__PURE__ */ new Set();
  const get = () => state;
  const set = (value2) => {
    state = value2;
    subscribers.forEach((callback) => callback());
  };
  const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };
  return { get, set, subscribe };
}

// src/colyseus.ts
var colyseus = (endpoint, schema) => {
  const client = new Client(endpoint);
  const roomStore = store(void 0);
  const stateStore = store(void 0);
  let connecting = false;
  const connectToColyseus = async (roomName, options = {}) => {
    if (connecting || roomStore.get()) return;
    connecting = true;
    try {
      const room = await client.joinOrCreate(roomName, options, schema);
      roomStore.set(room);
      stateStore.set(room.state);
      const updatedCollectionsMap = {};
      for (const [key, value] of Object.entries(room.state)) {
        if (typeof value !== "object" || !value.clone || !value.onAdd || !value.onRemove) {
          continue;
        }
        updatedCollectionsMap[key] = false;
        value.onAdd(() => {
          updatedCollectionsMap[key] = true;
        });
        value.onRemove(() => {
          updatedCollectionsMap[key] = true;
        });
      }
      room.onStateChange((state) => {
        if (!state) return;
        const copy = { ...state };
        for (const [key, update] of Object.entries(updatedCollectionsMap)) {
          if (!update) continue;
          updatedCollectionsMap[key] = false;
          const value = state[key];
          if (value.clone) {
            copy[key] = value.clone();
          }
        }
        stateStore.set(copy);
      });
      console.log(
        `Successfully connected to Colyseus room ${roomName} at ${endpoint}`
      );
    } catch (e) {
      console.error("Failed to connect to Colyseus!");
      console.log(e);
    } finally {
      connecting = false;
    }
  };
  const disconnectFromColyseus = async () => {
    const room = roomStore.get();
    if (!room) return;
    roomStore.set(void 0);
    stateStore.set(void 0);
    try {
      await room.leave();
      console.log("Disconnected from Colyseus!");
    } catch {
    }
  };
  const useColyseusRoom = () => {
    const subscribe = (callback) => roomStore.subscribe(() => callback());
    const getSnapshot = () => {
      const colyseus2 = roomStore.get();
      return colyseus2;
    };
    return useSyncExternalStore(subscribe, getSnapshot);
  };
  function useColyseusState(selector) {
    const subscribe = (callback) => stateStore.subscribe(() => callback());
    const getSnapshot = () => {
      const state = stateStore.get();
      return state && selector ? selector(state) : state;
    };
    return useSyncExternalStore(subscribe, getSnapshot);
  }
  return {
    client,
    connectToColyseus,
    disconnectFromColyseus,
    useColyseusRoom,
    useColyseusState
  };
};
export {
  colyseus,
  store
};
//# sourceMappingURL=index.mjs.map