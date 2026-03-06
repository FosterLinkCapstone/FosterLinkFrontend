import { useState, useCallback } from "react";

/**
 * Manages like/unlike state with optimistic update and rollback on error.
 *
 * @param initialLiked - Whether the item is initially liked
 * @param initialLikeCount - The starting like count
 * @param apiCall - The API call to perform the like/unlike action
 */
export function useLikeToggle(
    initialLiked: boolean,
    initialLikeCount: number,
    apiCall: () => Promise<{ isError: boolean }>
) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [likeInFlight, setLikeInFlight] = useState(false);

    const toggleLike = useCallback(() => {
        if (likeInFlight) return;
        setLikeInFlight(true);

        const wasLiked = isLiked;
        const delta = wasLiked ? -1 : 1;

        setIsLiked(!wasLiked);
        setLikeCount(c => Math.max(0, c + delta));

        apiCall().then(res => {
            if (res.isError) {
                setIsLiked(wasLiked);
                setLikeCount(c => Math.max(0, c - delta));
            }
        }).finally(() => {
            setLikeInFlight(false);
        });
    }, [isLiked, likeInFlight, apiCall]);

    return { isLiked, likeCount, likeInFlight, toggleLike };
}
