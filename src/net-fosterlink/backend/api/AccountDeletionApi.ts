import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
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
    return {
        requestDeletion: async (clearAccount: boolean): Promise<ErrorWrapper<void>> => {
            try {
                await auth.api.post(`/account-deletion/request?clearAccount=${clearAccount}`)
                return { isError: false, error: undefined, data: undefined }
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 400: return { isError: true, error: "You already have a pending deletion request.", data: undefined }
                        case 403: return { isError: true, error: "You must be logged in.", data: undefined }
                        default: return { isError: true, error: "An unexpected error occurred.", data: undefined }
                    }
                }
                return { isError: true, error: "Network error.", data: undefined }
            }
        },

        cancelDeletion: async (): Promise<ErrorWrapper<void>> => {
            try {
                await auth.api.delete("/account-deletion/cancel")
                return { isError: false, error: undefined, data: undefined }
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 403: return { isError: true, error: "You must be logged in.", data: undefined }
                        case 404: return { isError: true, error: "No pending deletion request found.", data: undefined }
                        default: return { isError: true, error: "An unexpected error occurred.", data: undefined }
                    }
                }
                return { isError: true, error: "Network error.", data: undefined }
            }
        },

        getMyRequest: async (): Promise<ErrorWrapper<AccountDeletionRequestModel | null>> => {
            try {
                const res = await auth.api.get("/account-deletion/my-request")
                return { isError: false, error: undefined, data: res.data }
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 403: return { isError: true, error: "You must be logged in.", data: undefined }
                        default: return { isError: true, error: "An unexpected error occurred.", data: undefined }
                    }
                }
                return { isError: true, error: "Network error.", data: undefined }
            }
        },

        getRequests: async (pageNumber: number, sortBy: "recency" | "urgency" = "recency"): Promise<ErrorWrapper<GetAccountDeletionRequestsResponse>> => {
            try {
                const res = await auth.api.get(`/account-deletion/requests?pageNumber=${pageNumber}&sortBy=${sortBy}`)
                return { isError: false, error: undefined, data: res.data }
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 403: return { isError: true, error: "Not authorized.", data: undefined }
                        default: return { isError: true, error: "An unexpected error occurred.", data: undefined }
                    }
                }
                return { isError: true, error: "Network error.", data: undefined }
            }
        },

        approveRequest: async (requestId: number): Promise<ErrorWrapper<void>> => {
            try {
                await auth.api.post(`/account-deletion/approve?requestId=${requestId}`)
                return { isError: false, error: undefined, data: undefined }
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 403: return { isError: true, error: "Not authorized.", data: undefined }
                        case 404: return { isError: true, error: "Deletion request not found.", data: undefined }
                        default: return { isError: true, error: "An unexpected error occurred.", data: undefined }
                    }
                }
                return { isError: true, error: "Network error.", data: undefined }
            }
        },

        delayRequest: async (requestId: number, reason: string): Promise<ErrorWrapper<void>> => {
            try {
                await auth.api.post("/account-deletion/delay", { requestId, reason })
                return { isError: false, error: undefined, data: undefined }
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 400: return { isError: true, error: "Invalid request. Please check your inputs.", data: undefined }
                        case 403: return { isError: true, error: "Not authorized.", data: undefined }
                        case 404: return { isError: true, error: "Deletion request not found.", data: undefined }
                        default: return { isError: true, error: "An unexpected error occurred.", data: undefined }
                    }
                }
                return { isError: true, error: "Network error.", data: undefined }
            }
        }
    }
}
