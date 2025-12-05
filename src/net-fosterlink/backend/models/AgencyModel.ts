import type { AgentInfoModel } from "./AgentInfoModel";
import type { LocationModel } from "./LocationModel";
import type { UserModel } from "./UserModel";

export interface AgencyModel {
    id: number,
    agencyName: string,
    agencyMissionStatement: string,
    agencyWebsiteLink: string,
    location: LocationModel,
    agent: UserModel,
    agentInfo: AgentInfoModel,
    approved: number,
    approvedByUsername: string
}