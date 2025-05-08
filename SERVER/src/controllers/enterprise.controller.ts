// src/controllers/enterprise.controller.ts
import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import Organization, { IOrganization } from "../models/organization.model";
import TeamContract from "../models/team-contract.model";
import AuditLog from "../models/audit-log.model";
import ContractAnalysisSchema from "../models/contract.model";
import Stripe from "stripe";
// Import the email service functions correctly
import { 
  sendEnterpriseInviteEmail, 
  sendEnterpriseWelcomeEmail 
} from "../services/email.service";
import crypto from "crypto";
import mongoose from "mongoose";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-03-31.basil"
});

// Helper type for MongoDB document with proper _id type
type WithId<T> = T & { 
    _id: mongoose.Types.ObjectId;
};

// Types for properly typed MongoDB documents
type UserWithId = WithId<IUser> & { 
  organizationId?: mongoose.Types.ObjectId;
};

type OrganizationWithId = WithId<IOrganization>;

// Create new organization
export const createOrganization = async (req: Request, res: Response) => {
    // Fix user._id unknown type by casting properly
    const user = req.user as UserWithId;
    const { organizationName, domain, billingEmail } = req.body;

    if (!organizationName || !domain || !billingEmail) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Check if organization with domain already exists
        const existingOrg = await Organization.findOne({ domain });
        if (existingOrg) {
            return res.status(409).json({ error: "Organization with this domain already exists" });
        }

        // Create Stripe customer for the organization
        const customer = await stripe.customers.create({
            email: billingEmail,
            name: organizationName,
            metadata: {
                organizationType: "enterprise"
            }
        });

        // Create new organization
        const newOrganization = await Organization.create({
            name: organizationName,
            domain,
            billingEmail,
            stripeCustomerId: customer.id,
            admins: [user._id],
            features: ["team-collaboration", "contract-sharing", "analytics-dashboard"]
        });

        // Update user to be an admin of this organization
        await User.findByIdAndUpdate(user._id, {
            organizationId: newOrganization._id,
            role: "admin",
            isEnterprise: true,
            isPremium: true, // Enterprise users get premium features
            permissions: ["manage_users", "manage_billing", "manage_contracts", "create_templates"]
        });

        // Create audit log for organization creation
        await AuditLog.create({
            organizationId: newOrganization._id,
            userId: user._id,
            action: "organization_created",
            resourceType: "organization",
            resourceId: newOrganization._id,
            details: `Organization "${organizationName}" created`,
            ipAddress: req.ip
        });

        // Send welcome email
        await sendEnterpriseWelcomeEmail(user.email, user.displayName, newOrganization.name);

        res.status(201).json({
            success: true,
            organization: newOrganization
        });
    } catch (error) {
        console.error("Organization creation error:", error);
        res.status(500).json({
            error: "Failed to create organization",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Invite user to organization
export const inviteTeamMember = async (req: Request, res: Response) => {
    // Fix user._id unknown type
    const user = req.user as UserWithId;
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
    }

    try {
        // Verify user is an admin or manager in an organization
        if (!user.organizationId || (user.role !== "admin" && user.role !== "manager")) {
            return res.status(403).json({ error: "Unauthorized: Only admins and managers can invite team members" });
        }

        // Get organization info
        const organization = await Organization.findById(user.organizationId);
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Check organization user limits - cast organization for type safety
        const typedOrg = organization as OrganizationWithId;
        const currentUsers = await User.countDocuments({ organizationId: user.organizationId });
        if (currentUsers >= typedOrg.maxUsers) {
            return res.status(403).json({ error: "Organization has reached maximum user limit" });
        }

        // Check if user is already in the system
        let invitedUser = await User.findOne({ email });

        // Create invite token and expiration
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        if (invitedUser) {
            // User exists, update with invite
            await User.findByIdAndUpdate(invitedUser._id, {
                inviteToken,
                inviteExpires,
                invitedBy: user._id
            });
        } else {
            // Create a new user placeholder with invite info
            invitedUser = await User.create({
                email,
                displayName: email.split('@')[0], // Temporary display name
                googleId: `placeholder_${crypto.randomBytes(16).toString('hex')}`, // Placeholder
                organizationId: user.organizationId,
                role,
                isEnterprise: true,
                inviteToken,
                inviteExpires,
                invitedBy: user._id
            });
        }

        // Send invite email
        await sendEnterpriseInviteEmail(
            email, 
            typedOrg.name, 
            user.displayName, 
            inviteToken, 
            role
        );

        // Create audit log for invitation
        await AuditLog.create({
            organizationId: user.organizationId,
            userId: user._id,
            action: "user_invited",
            resourceType: "user",
            resourceId: invitedUser._id,
            details: `User ${email} invited with role ${role}`,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: `Invitation sent to ${email}`
        });
    } catch (error) {
        console.error("Team member invitation error:", error);
        res.status(500).json({
            error: "Failed to invite team member",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Share contract with team members
export const shareContractWithTeam = async (req: Request, res: Response) => {
    // Fix user._id unknown type
    const user = req.user as UserWithId;
    const { contractId, sharedWith, accessLevel, message } = req.body;

    if (!contractId || !sharedWith || !Array.isArray(sharedWith)) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Verify user is in organization
        if (!user.organizationId) {
            return res.status(403).json({ error: "Only organization members can share contracts" });
        }

        // Verify contract exists and belongs to user
        const contract = await ContractAnalysisSchema.findOne({
            _id: contractId,
            userId: user._id
        });

        if (!contract) {
            return res.status(404).json({ error: "Contract not found or you don't have permission" });
        }

        // Verify users to share with exist in the organization
        const orgUsers = await User.find({
            _id: { $in: sharedWith },
            organizationId: user.organizationId
        });

        if (orgUsers.length !== sharedWith.length) {
            return res.status(400).json({ error: "Some users are not in your organization" });
        }

        // Check if contract is already shared and update, or create new team contract
        let teamContract = await TeamContract.findOne({
            contractId,
            organizationId: user.organizationId
        });

        if (teamContract) {
            // Update existing team contract
            teamContract.sharedWith = Array.from(new Set([...teamContract.sharedWith, ...sharedWith]));
            teamContract.accessLevel = accessLevel || teamContract.accessLevel;
            
            // Use the properly typed user._id directly - it's already a mongoose.Types.ObjectId
            teamContract.history.push({
                changedBy: user._id,
                timestamp: new Date(),
                action: "update_sharing",
                details: `Sharing updated by ${user.displayName}`
            });
            await teamContract.save();
        } else {
            // Create new team contract
            teamContract = await TeamContract.create({
                contractId,
                organizationId: user.organizationId,
                sharedBy: user._id,
                sharedWith,
                accessLevel: accessLevel || "view",
                history: [{
                    changedBy: user._id,
                    timestamp: new Date(),
                    action: "initial_sharing",
                    details: `Initially shared by ${user.displayName}`
                }]
            });
        }

        // Create audit log for sharing
        await AuditLog.create({
            organizationId: user.organizationId,
            userId: user._id,
            action: "contract_shared",
            resourceType: "contract",
            resourceId: contract._id,
            details: `Contract shared with ${sharedWith.length} team members`,
            ipAddress: req.ip
        });

        // Send notification emails to team members
        // This would be implemented in email.service.ts

        res.status(200).json({
            success: true,
            teamContract
        });
    } catch (error) {
        console.error("Contract sharing error:", error);
        res.status(500).json({
            error: "Failed to share contract",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Get organization contracts
export const getOrganizationContracts = async (req: Request, res: Response) => {
    // Fix user._id unknown type
    const user = req.user as UserWithId;
    
    try {
        // Verify user is in organization
        if (!user.organizationId) {
            return res.status(403).json({ error: "Only organization members can access team contracts" });
        }

        // Get contracts shared with the user
        const sharedWithUser = await TeamContract.find({
            organizationId: user.organizationId,
            $or: [
                { sharedBy: user._id },
                { sharedWith: user._id }
            ]
        }).populate({
            path: 'contractId',
            select: 'contractType summary risks opportunities overallScore createdAt'
        }).populate({
            path: 'sharedBy',
            select: 'displayName email profilePicture'
        });

        // Create audit log for accessing team contracts
        await AuditLog.create({
            organizationId: user.organizationId,
            userId: user._id,
            action: "viewed_team_contracts",
            resourceType: "contract",
            details: "User viewed organization contracts",
            ipAddress: req.ip
        });

        res.status(200).json(sharedWithUser);
    } catch (error) {
        console.error("Get organization contracts error:", error);
        res.status(500).json({
            error: "Failed to retrieve organization contracts",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Create enterprise subscription
export const createEnterpriseSubscription = async (req: Request, res: Response) => {
    // Fix user._id unknown type
    const user = req.user as UserWithId;
    const { planType } = req.body;

    if (!planType || !["basic", "professional", "enterprise"].includes(planType)) {
        return res.status(400).json({ error: "Invalid plan type" });
    }

    try {
        // Verify user is an admin
        if (!user.organizationId || user.role !== "admin") {
            return res.status(403).json({ error: "Only organization admins can manage subscriptions" });
        }

        // Find organization and properly type it
        const organization = await Organization.findById(user.organizationId) as OrganizationWithId | null;
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Set price ID based on plan type
        let priceId: string;
        let maxUsers: number;
        
        switch (planType) {
            case "basic":
                priceId = "price_enterprise_basic_monthly"; // This would be your actual Stripe price ID
                maxUsers = 10;
                break;
            case "professional":
                priceId = "price_enterprise_pro_monthly";
                maxUsers = 25;
                break;
            case "enterprise":
                priceId = "price_enterprise_unlimited_monthly";
                maxUsers = 100;
                break;
            default:
                return res.status(400).json({ error: "Invalid plan type" });
        }

        // Create the checkout session - Now organization._id is properly typed
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            success_url: `${process.env.CLIENT_URL}/enterprise-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/enterprise-cancel`,
            customer: organization.stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            metadata: {
                organizationId: organization._id.toString(),
                planType,
                maxUsers: maxUsers.toString()
            }
        });

        // Create audit log for subscription checkout
        await AuditLog.create({
            organizationId: user.organizationId,
            userId: user._id,
            action: "subscription_checkout",
            resourceType: "organization",
            resourceId: organization._id,
            details: `Started ${planType} subscription checkout`,
            ipAddress: req.ip
        });

        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error("Enterprise subscription creation error:", error);
        res.status(500).json({
            error: "Failed to create subscription",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Add controller export
export default {
    createOrganization,
    inviteTeamMember,
    shareContractWithTeam,
    getOrganizationContracts,
    createEnterpriseSubscription
};