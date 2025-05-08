import { Document, model, Schema } from "mongoose";

export interface IOrganization extends Document {
    name: string;
    domain: string;
    planType: "basic" | "professional" | "enterprise";
    maxUsers: number;
    features: string[];
    billingEmail: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    admins: Schema.Types.ObjectId[];
    teamSettings: {
        allowPublicContracts: boolean;
        requireApproval: boolean;
        customTemplates: boolean;
        dataRetentionDays: number;
        auditLoggingEnabled: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema({
    name: {type: String, required: true},
    domain: {type: String, required: true, unique: true},
    planType: {
        type: String, 
        enum: ["basic", "professional", "enterprise"], 
        default: "basic"
    },
    maxUsers: {type: Number, default: 5},
    features: [{type: String}],
    billingEmail: {type: String, required: true},
    stripeCustomerId: {type: String},
    stripeSubscriptionId: {type: String},
    admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
    teamSettings: {
        allowPublicContracts: {type: Boolean, default: false},
        requireApproval: {type: Boolean, default: true},
        customTemplates: {type: Boolean, default: false},
        dataRetentionDays: {type: Number, default: 365},
        auditLoggingEnabled: {type: Boolean, default: false}
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export default model<IOrganization>("Organization", OrganizationSchema);
