import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
    googleId: string;
    email: string;
    displayName: string;
    profilePicture: string;
    isPremium: boolean;
    // New fields for enterprise
    organizationId?: Types.ObjectId;
    role?: "admin" | "manager" | "member";
    isEnterprise?: boolean;
    permissions?: string[];
    invitedBy?: Types.ObjectId;
    inviteToken?: string;
    inviteExpires?: Date;
}

const UserSchema = new Schema({
   googleId: {type: String, required: true, unique: true},
   email: {type: String, required: true, unique: true},
   displayName: {type: String, required: true},
   profilePicture: {type: String},
   isPremium: {type: Boolean, default: false},
   // Enterprise fields
   organizationId: {type: Schema.Types.ObjectId, ref: 'Organization'},
   role: {type: String, enum: ["admin", "manager", "member"]},
   isEnterprise: {type: Boolean, default: false},
   permissions: [{type: String}],
   invitedBy: {type: Schema.Types.ObjectId, ref: 'User'},
   inviteToken: {type: String},
   inviteExpires: {type: Date},
});

export default model<IUser>("User", UserSchema);