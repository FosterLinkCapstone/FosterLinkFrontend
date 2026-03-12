export interface AuditLogEntryModel {
    id: number;
    createdAt: string;
    action: string;
    targetUser: string;
    actingUser: string;
    displayMessage: string;
}

export interface GetAuditLogModel {
    entries: AuditLogEntryModel[];
    totalPages: number;
}
