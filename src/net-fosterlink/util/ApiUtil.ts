import type axios from "axios";
import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { extractValidationError, getValidationErrors } from "@/net-fosterlink/util/ValidationError";

export const enum RequestType {
    GET,
    POST,
    PUT,
    DELETE
}

export type ApiClient = ReturnType<typeof axios.create>;

export const doGenericRequest = async <T>(
    api: ApiClient,
    type: RequestType,
    uri: string,
    payload: unknown = {},
    defaultErrors: Map<number, string>,
    mapSuccess?: (data: any) => T
): Promise<ErrorWrapper<T>> => {
    try {
        let requestPromise;
        switch (type) {
            case RequestType.GET:
                requestPromise = api.get(uri);
                break;
            case RequestType.POST:
                requestPromise = api.post(uri, payload);
                break;
            case RequestType.PUT:
                requestPromise = api.put(uri, payload);
                break;
            case RequestType.DELETE:
                requestPromise = api.delete(uri);
                break;
            default:
                throw new Error("Unsupported request type");
        }

        const res = await requestPromise;
        const mapped = mapSuccess ? mapSuccess(res.data) : (res.data as T);
        return { data: mapped, error: undefined, isError: false };
    } catch (err: any) {
        if (err.response) {
            const validation = extractValidationError(err.response);
            if (validation) {
                return {
                    data: undefined,
                    isError: true,
                    error: validation,
                    validationErrors: getValidationErrors(err.response)
                };
            }

            const status = err.response.status as number;
            if (defaultErrors.has(status)) {
                return { data: undefined, isError: true, error: defaultErrors.get(status) };
            }

            return { data: undefined, isError: true, error: defaultErrors.get(-1) ?? "Internal server error. Please try again later." };
        }

        return { data: undefined, isError: true, error: defaultErrors.get(-1) ?? "Internal server error. Please try again later." };
    }
};

