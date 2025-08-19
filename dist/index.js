"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  colyseus: () => colyseus,
  store: () => store
});
module.exports = __toCommonJS(index_exports);

// src/colyseus.ts
var import_colyseus = require("colyseus.js");
var import_react = require("react");

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
  const client = new import_colyseus.Client(endpoint);
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
    return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot);
  };
  function useColyseusState(selector) {
    const subscribe = (callback) => stateStore.subscribe(() => callback());
    const getSnapshot = () => {
      const state = stateStore.get();
      return state && selector ? selector(state) : state;
    };
    return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot);
  }
  return {
    client,
    connectToColyseus,
    disconnectFromColyseus,
    useColyseusRoom,
    useColyseusState
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  colyseus,
  store
});
//# sourceMappingURL=index.js.map