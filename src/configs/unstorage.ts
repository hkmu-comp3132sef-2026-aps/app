import { createStorage } from "unstorage";

import { asyncStorageDriver } from "#/utils/async-storage-driver";

const storage = createStorage({
    driver: asyncStorageDriver({
        id: "sch",
    }),
});

type Storage = typeof storage;

export type { Storage };
export { storage };
