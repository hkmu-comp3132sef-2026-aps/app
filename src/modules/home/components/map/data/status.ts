import type { PaginationState } from "#/modules/home/components/map/@types";

const getHomeMapStatusText = (
    pagination: PaginationState,
    error: unknown,
    isLoading: boolean,
): string | undefined => {
    if (!(error || isLoading || pagination.hasNextPage)) return void 0;

    if (error) return "Something went wrong.";

    return "Loading...";
};

export { getHomeMapStatusText };
