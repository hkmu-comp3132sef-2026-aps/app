import type { PaginationState } from "#/modules/home/components/map/@types";

const createEmptyPaginationState = (): PaginationState => {
    return {
        endCursor: void 0,
        hasNextPage: false,
        loadedCount: 0,
        totalCount: 0,
    };
};

export { createEmptyPaginationState };
