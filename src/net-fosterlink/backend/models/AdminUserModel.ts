export interface AdminUserModel {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string | null;
    profilePictureUrl: string | null;

    // Roles
    administrator: boolean;
    faqAuthor: boolean;
    verifiedAgencyRep: boolean;
    verifiedFoster: boolean;
    idVerified: boolean;

    // Punishment status
    bannedAt: string | null;
    restrictedAt: string | null;
    restrictedUntil: string | null;

    // Activity stats
    postCount: number;
    replyCount: number;
    agencyCount: number;
    faqAnswerCount: number;
    faqSuggestionCount: number;

    // Deletion status
    pendingDeletion: boolean;
}

import type { PaginatedResponse } from "./api/PaginatedResponse";

export type GetAdminUsersResponse = PaginatedResponse<AdminUserModel>;

export interface AdminUserStatsModel {
    totalUsers: number;
    totalAdministrators: number;
    totalFaqAuthors: number;
    totalAgents: number;
    totalDeletedAccounts: number;
}
