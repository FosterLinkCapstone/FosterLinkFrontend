import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { extractValidationError, getValidationErrors } from "@/net-fosterlink/util/ValidationError";
import type { AuthContextType } from "../AuthContext";
import type { AgencyModel } from "../models/AgencyModel";
import type { CreateAgencyModel } from "../models/api/CreateAgencyModel";
import type { GetAgenciesResponse } from "../models/api/GetAgenciesResponse";
import type { GetAgencyDeletionRequestsResponse } from "../models/api/GetAgencyDeletionRequestsResponse";

export interface AgencyApiType {
    getAll: (pageNumber: number) => Promise<ErrorWrapper<GetAgenciesResponse>>
    getPending: (pageNumber: number) => Promise<ErrorWrapper<GetAgenciesResponse>>
    approve: (id: number, approved: boolean) => Promise<ErrorWrapper<boolean>>
    countPending: () => Promise<ErrorWrapper<number>>
    create: (createModel: CreateAgencyModel) => Promise<ErrorWrapper<AgencyModel>>
    hideAgency: (id: number, hidden: boolean) => Promise<ErrorWrapper<boolean>>
    getHiddenAgencies: (pageNumber: number) => Promise<ErrorWrapper<GetAgenciesResponse>>
    deleteHiddenAgency: (id: number) => Promise<ErrorWrapper<boolean>>
    requestDeletion: (agencyId: number) => Promise<ErrorWrapper<boolean>>
    cancelDeletionRequest: (agencyId: number) => Promise<ErrorWrapper<boolean>>
    getDeletionRequests: (pageNumber: number) => Promise<ErrorWrapper<GetAgencyDeletionRequestsResponse>>
    approveDeletionRequest: (requestId: number, approved: boolean) => Promise<ErrorWrapper<boolean>>
}

export const agencyApi = (auth: AuthContextType): AgencyApiType => {

    return {
        getAll: async (pageNumber: number): Promise<ErrorWrapper<GetAgenciesResponse>> => {
            try {
                const res = await auth.api.get(`/agencies/all?pageNumber=${pageNumber}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be logged in to view agencies!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getPending: async (pageNumber: number): Promise<ErrorWrapper<GetAgenciesResponse>> => {
            try {
                const res = await auth.api.get(`/agencies/pending?pageNumber=${pageNumber}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can view pending agencies!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        approve: async (id: number, approved: boolean): Promise<ErrorWrapper<boolean>> => {
            try {
                await auth.api.post("/agencies/approve", {id: id, approved: approved})
                return {data: true, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can approve agencies!", isError: true}
                        case 404:
                            return {data: undefined, error: "Agency not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        countPending: async (): Promise<ErrorWrapper<number>> => {
            try {
                const res = await auth.api.get("/agencies/pending/count")
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can count pending agencies!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        create: async (createModel: CreateAgencyModel): Promise<ErrorWrapper<AgencyModel>> => {
            try {
                const res = await auth.api.post("/agencies/create", createModel)
                return {data: res.data, isError: false, error: undefined}
            } catch(err: any) {
                if (err.response) {
                    // Check for validation errors first
                    const validationError = extractValidationError(err.response);
                    if (validationError) {
                        return {data: undefined, isError: true, error: validationError, validationErrors: getValidationErrors(err.response)}
                    }
                    
                    switch (err.response.status) {
                        case 400:
                            return {data: undefined, isError: true, error: "Invalid agency data! Please check your inputs."}
                        case 502:
                            return {data: undefined, isError: true, error: "There was an issue validating that address. Please try again later"}
                        case 403:
                            return {data: undefined, isError:true, error: "You must be a designated agency representative to create an agency listing. If you believe this is a mistake, contact an administrator."}
                        default:
                            return {data: undefined, isError:true, error: "Internal server error"}
                    }
                }
            }
            return {data: undefined, isError:true, error: "Internal client error"}
        },
        hideAgency: async (id: number, hidden: boolean): Promise<ErrorWrapper<boolean>> => {
            try {
                await auth.api.post(`/agencies/hide?id=${id}&hidden=${hidden}`)
                return {data: true, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can hide agencies!", isError: true}
                        case 404:
                            return {data: undefined, error: "Agency not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getHiddenAgencies: async (pageNumber: number): Promise<ErrorWrapper<GetAgenciesResponse>> => {
            try {
                const res = await auth.api.get(`/agencies/getHidden?pageNumber=${pageNumber}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can view hidden agencies!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        deleteHiddenAgency: async (id: number): Promise<ErrorWrapper<boolean>> => {
            try {
                await auth.api.delete(`/agencies/delete?id=${id}`)
                return {data: true, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can delete hidden agencies!", isError: true}
                        case 404:
                            return {data: undefined, error: "Agency not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        requestDeletion: async (agencyId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                await auth.api.post(`/agencies/deletion-request?agencyId=${agencyId}`)
                return {data: true, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be the owner of this agency to request deletion.", isError: true}
                        case 404:
                            return {data: undefined, error: "Agency not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        cancelDeletionRequest: async (agencyId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                await auth.api.delete(`/agencies/deletion-request?agencyId=${agencyId}`)
                return {data: true, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only the requester can cancel this deletion request.", isError: true}
                        case 404:
                            return {data: undefined, error: "Deletion request not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getDeletionRequests: async (pageNumber: number): Promise<ErrorWrapper<GetAgencyDeletionRequestsResponse>> => {
            try {
                const res = await auth.api.get(`/agencies/deletion-requests?pageNumber=${pageNumber}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can view deletion requests!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        approveDeletionRequest: async (requestId: number, approved: boolean): Promise<ErrorWrapper<boolean>> => {
            try {
                await auth.api.post(`/agencies/deletion-request/approve?requestId=${requestId}&approved=${approved}`)
                return {data: true, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can approve deletion requests!", isError: true}
                        case 404:
                            return {data: undefined, error: "Deletion request not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        }
    }

}