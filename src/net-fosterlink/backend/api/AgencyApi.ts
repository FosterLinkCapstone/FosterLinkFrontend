import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";
import type { AgencyModel } from "../models/AgencyModel";
import type { CreateAgencyModel } from "../models/api/CreateAgencyModel";
import type { GetAgenciesResponse } from "../models/api/GetAgenciesResponse";
import type { GetAgencyDeletionRequestsResponse } from "../models/api/GetAgencyDeletionRequestsResponse";

export interface UpdateAgencyLocationPayload {
    locationAddrLine1: string;
    locationAddrLine2?: string;
    locationCity: string;
    locationState: string;
    locationZipCode: number;
}

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
    updateAgency: (id: number, name: string|null, missionStatement: string|null, websiteUrl: string|null) => Promise<ErrorWrapper<void>>
    updateAgencyLocation: (agencyId: number, payload: UpdateAgencyLocationPayload) => Promise<ErrorWrapper<void>>
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

    const defaultErrorsHideAgency: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can hide agencies!"],
        [404, "Agency not found!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsGetHiddenAgencies: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can view hidden agencies!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsDeleteHiddenAgency: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can delete hidden agencies!"],
        [404, "Agency not found!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsRequestDeletion: Map<number, string> = new Map<number, string>([
        [403, "You must be the owner of this agency to request deletion."],
        [404, "Agency not found!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsCancelDeletionRequest: Map<number, string> = new Map<number, string>([
        [403, "Only the requester can cancel this deletion request."],
        [404, "Deletion request not found!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsGetDeletionRequests: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can view deletion requests!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsApproveDeletionRequest: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can approve deletion requests!"],
        [404, "Deletion request not found!"],
        [-1, "Internal server error"]
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
        },
        hideAgency: async (id: number, hidden: boolean): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                `/agencies/hide?id=${id}&hidden=${hidden}`,
                {},
                defaultErrorsHideAgency
            );
        },
        getHiddenAgencies: async (pageNumber: number): Promise<ErrorWrapper<GetAgenciesResponse>> => {
            return doGenericRequest<GetAgenciesResponse>(
                auth.api,
                RequestType.GET,
                `/agencies/getHidden?pageNumber=${pageNumber}`,
                {},
                defaultErrorsGetHiddenAgencies
            );
        },
        deleteHiddenAgency: async (id: number): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.DELETE,
                `/agencies/delete?id=${id}`,
                {},
                defaultErrorsDeleteHiddenAgency
            );
        },
        requestDeletion: async (agencyId: number): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                `/agencies/deletion-request?agencyId=${agencyId}`,
                {},
                defaultErrorsRequestDeletion
            );
        },
        cancelDeletionRequest: async (agencyId: number): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.DELETE,
                `/agencies/deletion-request?agencyId=${agencyId}`,
                {},
                defaultErrorsCancelDeletionRequest
            );
        },
        getDeletionRequests: async (pageNumber: number): Promise<ErrorWrapper<GetAgencyDeletionRequestsResponse>> => {
            return doGenericRequest<GetAgencyDeletionRequestsResponse>(
                auth.api,
                RequestType.GET,
                `/agencies/deletion-requests?pageNumber=${pageNumber}`,
                {},
                defaultErrorsGetDeletionRequests
            );
        },
        approveDeletionRequest: async (requestId: number, approved: boolean): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                `/agencies/deletion-request/approve?requestId=${requestId}&approved=${approved}`,
                {},
                defaultErrorsApproveDeletionRequest
            );
        },
        updateAgency: async (agencyId: number, name: string|null, missionStatement: string|null, websiteUrl: string|null): Promise<ErrorWrapper<void>> => {
                return doGenericRequest<void>(
                    auth.api,
                    RequestType.PUT,
                    `/agencies/update`,
                    { agencyId, name, missionStatement, websiteUrl },
                    new Map<number, string>([
                        [400, "Invalid agency data! Please check your inputs."],
                        [403, "You must be the owner of this agency to update it."],
                        [404, "Agency not found!"],
                        [502, "There was an issue validating that address. Please try again later"],
                        [-1, "Internal client error"]
                    ])
                );
        },
        updateAgencyLocation: async (agencyId: number, payload: UpdateAgencyLocationPayload): Promise<ErrorWrapper<void>> => {
            return doGenericRequest<void>(
                auth.api,
                RequestType.PUT,
                "/agencies/update-location",
                { agencyId, ...payload },
                new Map<number, string>([
                    [400, "Invalid address. Check zip code (501–99950) and required fields."],
                    [403, "You must be the owner of this agency to update its location."],
                    [404, "Agency not found!"],
                    [-1, "Internal client error"]
                ])
            );
        }
    };
}