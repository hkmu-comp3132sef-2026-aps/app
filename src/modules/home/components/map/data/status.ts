import type { PaginationState } from "#/modules/home/components/map/@types";

const getHomeMapStatusText = (
    pagination: PaginationState,
    error: unknown,
    isLoading: boolean,
): string | null => {
    if (!(error || isLoading || pagination.hasNextPage)) {
        return null;
    }

    if (error) {
        return "Unable to finish loading schools";
    }

    if (pagination.totalCount > 0) {
        return `${pagination.loadedCount.toLocaleString()} / ${pagination.totalCount.toLocaleString()} schools`;
    }

    return "Loading schools";
};

export { getHomeMapStatusText };
