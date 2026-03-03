import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";
import type { AgencyModel } from "../models/AgencyModel";
import type { CreateAgencyModel } from "../models/api/CreateAgencyModel";
import type { GetAgenciesResponse } from "../models/api/GetAgenciesResponse";

export interface AgencyApiType {
    getAll: (pageNumber: number) => Promise<ErrorWrapper<GetAgenciesResponse>>
    getPending: (pageNumber: number) => Promise<ErrorWrapper<GetAgenciesResponse>>
    approve: (id: number, approved: boolean) => Promise<ErrorWrapper<boolean>>
    countPending: () => Promise<ErrorWrapper<number>>
    create: (createModel: CreateAgencyModel) => Promise<ErrorWrapper<AgencyModel>>
}

export const agencyApi = (auth: AuthContextType): AgencyApiType => {

    const defaultErrorsAll: Map<number, string> = new Map<number, string>([
        [403, "You must be logged in to view agencies!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsPending: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can view pending agencies!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsApprove: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can approve agencies!"],
        [404, "Agency not found!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsCountPending: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can count pending agencies!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsCreateAgency: Map<number, string> = new Map<number, string>([
        [400, "Invalid agency data! Please check your inputs."],
        [502, "There was an issue validating that address. Please try again later"],
        [403, "You must be a designated agency representative to create an agency listing. If you believe this is a mistake, contact an administrator."],
        [-1, "Internal client error"]
    ]);

    return {
        getAll: async (pageNumber: number): Promise<ErrorWrapper<GetAgenciesResponse>> => {
            return doGenericRequest<GetAgenciesResponse>(
                auth.api,
                RequestType.GET,
                `/agencies/all?pageNumber=${pageNumber}`,
                {},
                defaultErrorsAll
            )
        },
        getPending: async (pageNumber: number): Promise<ErrorWrapper<GetAgenciesResponse>> => {
            return doGenericRequest<GetAgenciesResponse>(
                auth.api,
                RequestType.GET,
                `/agencies/pending?pageNumber=${pageNumber}`,
                {},
                defaultErrorsPending
            )
        },
        approve: async (id: number, approved: boolean): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                "/agencies/approve",
                { id, approved },
                defaultErrorsApprove
            )
        },
        countPending: async (): Promise<ErrorWrapper<number>> => {
            return doGenericRequest<number>(
                auth.api,
                RequestType.GET,
                "/agencies/pending/count",
                {},
                defaultErrorsCountPending
            )
        },
        create: async (createModel: CreateAgencyModel): Promise<ErrorWrapper<AgencyModel>> => {
            return doGenericRequest<AgencyModel>(
                auth.api,
                RequestType.POST,
                "/agencies/create",
                createModel,
                defaultErrorsCreateAgency
            )
        }
    }

}