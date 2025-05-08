import { Request } from "express";
import AuditLog from "../models/audit-log.model";
import { IUser } from "../models/user.model";
import mongoose from "mongoose";

export const createAuditLog = async (
    req: Request,
    action: string,
    resourceType: "contract" | "user" | "organization" | "payment" | "template" | "settings",
    resourceId?: mongoose.Types.ObjectId | string,
    details?: string
): Promise<void> => {
    const user = req.user as IUser;
    
    if (!user || !user.organizationId) {
        // Only create audit logs for enterprise users
        return;
    }
    
    try {
        await AuditLog.create({
            organizationId: user.organizationId,
            userId: user._id,
            action,
            resourceType,
            resourceId: resourceId ? new mongoose.Types.ObjectId(resourceId) : undefined,
            details: details || `User performed ${action} on ${resourceType}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
        // Don't throw here - audit logs should never break app functionality
    }
};