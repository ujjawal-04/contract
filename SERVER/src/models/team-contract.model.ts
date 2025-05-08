import mongoose, { Document, Schema } from "mongoose";
import { IContractAnalysis } from "./contract.model";

export interface ITeamContract extends Document {
    contractId: mongoose.Types.ObjectId; // Reference to ContractAnalysis
    organizationId: mongoose.Types.ObjectId;
    sharedBy: mongoose.Types.ObjectId;
    sharedWith: mongoose.Types.ObjectId[];
    accessLevel: "view" | "comment" | "edit";
    comments: {
        userId: mongoose.Types.ObjectId;
        text: string;
        timestamp: Date;
        resolvedBy?: mongoose.Types.ObjectId;
        resolvedAt?: Date;
    }[];
    status: "draft" | "in-review" | "approved" | "rejected";
    reviewers: {
        userId: mongoose.Types.ObjectId;
        status: "pending" | "approved" | "rejected";
        comments?: string;
        timestamp?: Date;
    }[];
    version: number;
    history: {
        changedBy: mongoose.Types.ObjectId;
        timestamp: Date;
        action: string;
        details?: string;
    }[];
    tags: string[];
    isTemplate: boolean;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TeamContractSchema = new Schema({
    contractId: {
        type: Schema.Types.ObjectId,
        ref: 'ContractAnalysis',
        required: true
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    sharedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    accessLevel: {
        type: String,
        enum: ["view", "comment", "edit"],
        default: "view"
    },
    comments: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date
    }],
    status: {
        type: String,
        enum: ["draft", "in-review", "approved", "rejected"],
        default: "draft"
    },
    reviewers: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        comments: String,
        timestamp: Date
    }],
    version: {
        type: Number,
        default: 1
    },
    history: [{
        changedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            required: true
        },
        details: String
    }],
    tags: [String],
    isTemplate: {
        type: Boolean,
        default: false
    },
    expiryDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<ITeamContract>('TeamContract', TeamContractSchema);