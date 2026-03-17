import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";
import type { AccountDeletionRequestModel, GetAccountDeletionRequestsResponse } from "../models/AccountDeletionRequestModel";

export interface AccountDeletionApiType {
    requestDeletion: (clearAccount: boolean) => Promise<ErrorWrapper<void>>
    cancelDeletion: () => Promise<ErrorWrapper<void>>
    getMyRequest: () => Promise<ErrorWrapper<AccountDeletionRequestModel | null>>
    getRequests: (pageNumber: number, sortBy?: "recency" | "urgency") => Promise<ErrorWrapper<GetAccountDeletionRequestsResponse>>
    approveRequest: (requestId: number) => Promise<ErrorWrapper<void>>
    delayRequest: (requestId: number, reason: string) => Promise<ErrorWrapper<void>>
}

export const accountDeletionApi = (auth: AuthContextType): AccountDeletionApiType => {
    const defaultErrorsRequestDeletion: Map<number, string> = new Map([
        [400, "You already have a pending deletion request."],
        [403, "You must be logged in."],
        [-1, "An unexpected error occurred."]
    ]);

    const defaultErrorsCancelDeletion: Map<number, string> = new Map([
        [403, "You must be logged in."],
        [404, "No pending deletion request found."],
        [-1, "An unexpected error occurred."]
    ]);

    const defaultErrorsGetMyRequest: Map<number, string> = new Map([
        [403, "You must be logged in."],
        [-1, "An unexpected error occurred."]
    ]);

    const defaultErrorsGetRequests: Map<number, string> = new Map([
        [403, "Not authorized."],
        [-1, "An unexpected error occurred."]
    ]);

    const defaultErrorsApproveRequest: Map<number, string> = new Map([
        [403, "Not authorized."],
        [404, "Deletion request not found."],
        [-1, "An unexpected error occurred."]
    ]);

    const defaultErrorsDelayRequest: Map<number, string> = new Map([
        [400, "Invalid request. Please check your inputs."],
        [403, "Not authorized."],
        [404, "Deletion request not found."],
        [-1, "An unexpected error occurred."]
    ]);

    return {
        requestDeletion: async (clearAccount: boolean): Promise<ErrorWrapper<void>> => {
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/account-deletion/request?clearAccount=${clearAccount}`,
                {},
                defaultErrorsRequestDeletion
            );
        },

        cancelDeletion: async (): Promise<ErrorWrapper<void>> => {
            return doGenericRequest<void>(
                auth.api,
                RequestType.DELETE,
                "/account-deletion/cancel",
                {},
                defaultErrorsCancelDeletion
            );
        },

        getMyRequest: async (): Promise<ErrorWrapper<AccountDeletionRequestModel | null>> => {
            return doGenericRequest<AccountDeletionRequestModel | null>(
                auth.api,
                RequestType.GET,
                "/account-deletion/my-request",
                {},
                defaultErrorsGetMyRequest
            );
        },

        getRequests: async (pageNumber: number, sortBy: "recency" | "urgency" = "recency"): Promise<ErrorWrapper<GetAccountDeletionRequestsResponse>> => {
            return doGenericRequest<GetAccountDeletionRequestsResponse>(
                auth.api,
                RequestType.GET,
                `/account-deletion/requests?pageNumber=${pageNumber}&sortBy=${sortBy}`,
                {},
                defaultErrorsGetRequests
            );
        },

        approveRequest: async (requestId: number): Promise<ErrorWrapper<void>> => {
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/account-deletion/approve?requestId=${requestId}`,
                {},
                defaultErrorsApproveRequest
            );
        },

        delayRequest: async (requestId: number, reason: string): Promise<ErrorWrapper<void>> => {
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                "/account-deletion/delay",
                { requestId, reason },
                defaultErrorsDelayRequest
            );
        }
    };
};
