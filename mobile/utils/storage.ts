import type { StateStorage } from "zustand/middleware";

type KVEngine = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

const createFallbackEngine = (): KVEngine => {
  const memory = new Map<string, string>();

  return {
    getString: (key) => memory.get(key),
    set: (key, value) => {
      memory.set(key, value);
    },
    remove: (key) => {
      memory.delete(key);
    },
  };
};

const createEngine = (): KVEngine => {
  try {
    const { createMMKV } = require("react-native-mmkv") as {
      createMMKV: (config: { id: string }) => KVEngine;
    };

    return createMMKV({ id: "safrah-storage" });
  } catch {
    return createFallbackEngine();
  }
};

export const mmkv = createEngine();

export const zustandStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  removeItem: (name) => {
    mmkv.remove(name);
  },
};
