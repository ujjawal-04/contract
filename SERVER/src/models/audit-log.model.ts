import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
    organizationId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: string;
    resourceType: "contract" | "user" | "organization" | "payment" | "template" | "settings";
    resourceId?: mongoose.Types.ObjectId;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        enum: ["contract", "user", "organization", "payment", "template", "settings"],
        required: true
    },
    resourceId: {
        type: Schema.Types.ObjectId
    },
    details: {
        type: String,
        required: true
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);