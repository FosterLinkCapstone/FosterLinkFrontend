import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { extractValidationError, getValidationErrors } from "@/net-fosterlink/util/ValidationError";
import type { AuthContextType } from "../AuthContext";
import type { AgencyModel } from "../models/AgencyModel";
import type { CreateAgencyModel } from "../models/api/CreateAgencyModel";

export interface AgencyApiType {
    getAll: () => Promise<ErrorWrapper<AgencyModel[]>>
    getPending: () => Promise<ErrorWrapper<AgencyModel[]>>
    approve: (id: number, approved: boolean) => Promise<ErrorWrapper<boolean>>
    countPending: () => Promise<ErrorWrapper<number>>
    create: (createModel: CreateAgencyModel) => Promise<ErrorWrapper<AgencyModel>>
}

export const agencyApi = (auth: AuthContextType): AgencyApiType => {

    return {
        getAll: async (): Promise<ErrorWrapper<AgencyModel[]>> => {
            try {
                const res = await auth.api.get('/agencies/all')
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
        getPending: async (): Promise<ErrorWrapper<AgencyModel[]>> => {
            try {
                const res = await auth.api.get("/agencies/pending")
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
        }
    }

}