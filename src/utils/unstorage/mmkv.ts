import type { Configuration, MMKV } from "react-native-mmkv";
import type { Driver, StorageValue } from "unstorage";

import { createMMKV } from "react-native-mmkv";
import { defineDriver } from "unstorage";

type StorageOptions = Configuration;

const storageDriver = defineDriver<StorageOptions, never>(
    (options: StorageOptions): Driver<StorageOptions, never> => {
        const storage: MMKV = createMMKV({
            compareBeforeSet: true,
            ...options,
        });

        return {
            name: "react-native-mmkv",
            options,
            hasItem(key: string): boolean {
                return storage.contains(key);
            },
            getItem(key: string): StorageValue {
                return storage.getString(key) ?? null;
            },
            setItem(key: string, value: string): void {
                storage.set(key, value);
            },
            removeItem(key: string): void {
                storage.remove(key);
            },
            getKeys(): string[] {
                return storage.getAllKeys();
            },
            clear(): void {
                storage.clearAll();
            },
        };
    },
);

export type { StorageOptions };
export { storageDriver };
