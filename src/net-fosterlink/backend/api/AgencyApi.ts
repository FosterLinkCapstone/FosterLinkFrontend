import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import type { AuthContextType } from "../AuthContext";
import type { AgencyModel } from "../models/AgencyModel";
import type { CreateAgencyModel } from "../models/api/CreateAgencyModel";

export interface AgencyApiType {
    getAll: () => Promise<AgencyModel[]>
    getPending: () => Promise<AgencyModel[]>
    approve: (id: number, approved: boolean) => Promise<boolean>
    countPending: () => Promise<number>
    create: (createModel: CreateAgencyModel) => Promise<ErrorWrapper<AgencyModel>>
}

export const agencyApi = (auth: AuthContextType): AgencyApiType => {

    return {
        getAll: async (): Promise<AgencyModel[]> => {
            const res = await auth.api.get('/agencies/all')
            return res.data
        },
        getPending: async (): Promise<AgencyModel[]> => {
            const res = await auth.api.get("/agencies/pending")
            return res.data
        },
        approve: async (id: number, approved: boolean): Promise<boolean> => {
            try {
                await auth.api.post("/agencies/approve", {id: id, approved: approved})
                return true
            } catch(err: any) {
                return false
            }
        },
        countPending: async (): Promise<number> => {
            try {
                const res = await auth.api.get("/agencies/pending/count")
                return res.data
            } catch (err:any) {
                return 0
            }
        },
        create: async (createModel: CreateAgencyModel): Promise<ErrorWrapper<AgencyModel>> => {
            try {
                const res = await auth.api.post("/agencies/create", createModel)
                return {data: res.data, isError: false, error: undefined}
            } catch(err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 400:
                            return {data: undefined, isError: true, error: "Invalid address! Please try again..."}
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