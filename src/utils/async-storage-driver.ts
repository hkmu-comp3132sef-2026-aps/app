import type { AsyncStorage } from "@react-native-async-storage/async-storage";
import type { Driver, StorageValue } from "unstorage";

import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { defineDriver } from "unstorage";

type AsyncStorageOptions = {
    id: string;
};

const asyncStorageDriver = defineDriver<AsyncStorageOptions, never>(
    (options: AsyncStorageOptions): Driver<AsyncStorageOptions, never> => {
        const storage: AsyncStorage = createAsyncStorage(options.id);

        return {
            name: "react-native-async-storage",
            options,
            async hasItem(key: string): Promise<boolean> {
                return (await storage.getItem(key)) !== null;
            },
            async getItem(key: string): Promise<StorageValue> {
                return await storage.getItem(key);
            },
            async setItem(key: string, value: string): Promise<void> {
                return await storage.setItem(key, value);
            },
            async removeItem(key: string): Promise<void> {
                return await storage.removeItem(key);
            },
            async getKeys(): Promise<string[]> {
                return await storage.getAllKeys();
            },
            async clear(): Promise<void> {
                return await storage.clear();
            },
        };
    },
);

export { asyncStorageDriver };
