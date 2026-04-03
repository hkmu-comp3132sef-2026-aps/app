import { createStorage } from "unstorage";

import { storageDriver } from "#/utils/unstorage/mmkv";

const storage = createStorage({
    driver: storageDriver({
        id: "sch",
    }),
});

type Storage = typeof storage;

export type { Storage };
export { storage };
