import { useState, useCallback } from "react";
import { confirm } from "../components/ConfirmDialog";

interface UseConfirmActionOptions<T> {
    message: string;
    onConfirm: () => Promise<{ isError: boolean; error?: string; data?: T }>;
    onSuccess?: (data: T | undefined) => void;
    onError?: (error: string) => void;
}

/**
 * Wraps the common pattern of: confirm dialog → API call → success/error handling.
 * Returns an `execute` function and a `loading` flag.
 */
export function useConfirmAction<T = void>({
    message,
    onConfirm,
    onSuccess,
    onError,
}: UseConfirmActionOptions<T>) {
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async (): Promise<boolean> => {
        const confirmed = await confirm({ message });
        if (!confirmed) return false;

        setLoading(true);
        const res = await onConfirm();
        setLoading(false);

        if (!res.isError) {
            onSuccess?.(res.data);
            return true;
        } else {
            onError?.(res.error ?? "An unknown error occurred.");
            return false;
        }
    }, [message, onConfirm, onSuccess, onError]);

    return { execute, loading };
}
