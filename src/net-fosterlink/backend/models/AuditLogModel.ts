export interface AuditLogEntryModel {
    id: number;
    createdAt: string;
    action: string;
    targetUser: string;
    actingUser: string;
    displayMessage: string;
}

import type { PaginatedResponse } from "./api/PaginatedResponse";

export type GetAuditLogModel = PaginatedResponse<AuditLogEntryModel>;
