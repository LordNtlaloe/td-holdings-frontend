import { User } from "./user";

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: any;
    createdAt: Date;

    // Relationships
    user: User;
}