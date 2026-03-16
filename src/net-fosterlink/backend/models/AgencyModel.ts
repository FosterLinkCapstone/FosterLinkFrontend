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
    /** Whether the agent opted in to showing their contact info publicly. */
    showContactInfo: boolean,
    /**
     * Agent email address. Present in public responses when showContactInfo is true,
     * or always in admin responses (prefer agentInfo.email there).
     */
    agentEmail?: string | null,
    /**
     * Agent phone number. Present in public responses when showContactInfo is true,
     * or always in admin responses (prefer agentInfo.phoneNumber there).
     */
    agentPhoneNumber?: string | null,
    /** Full agent contact info including internal user ID — only present in admin responses. */
    agentInfo?: AgentInfoModel | null,
    approved: number,
    approvedByUsername?: string,
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