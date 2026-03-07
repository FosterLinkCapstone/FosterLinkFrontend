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
    approvedByUsername: string,
    /** When the agency was created (ISO date string). */
    createdAt?: string,
    /** When the agency was last updated; null if never updated (ISO date string). */
    updatedAt?: string | null,
    hiddenByUsername?: string,
    /** Set when the owner has requested deletion (pending request). */
    deletionRequestedAt?: string,
    deletionRequestedByUsername?: string,
    /** Pending deletion request id; set when deletionRequestedByUsername is set (for admin Accept/Deny). */
    deletionRequestId?: number
}