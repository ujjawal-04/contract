import { Request, Response } from "express";
import Organization from "../models/organization.model";
import User, { IUser } from "../models/user.model";
import { Types } from "mongoose";


export const createOrganization = async (req: Request, res: Response) => {
  const user = req.user;
  const { name, domains, contactEmail } = req.body;

  if (!name || !contactEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create new organization
    const organization = new Organization({
      name,
      plan: "enterprise",
      maxUsers: 50, // Default for enterprise
      adminUsers: [user._id],
      settings: {
        allowedDomains: domains || []
      },
      billingInfo: {
        contactEmail
      }
    });

    const savedOrg = await organization.save();

    // Update the user to be part of this organization and set as admin
    await User.findByIdAndUpdate(user._id, {
      organizationId: savedOrg._id,
      isEnterprise: true,
      role: "admin"
    });

    res.status(201).json(savedOrg);
  } catch (error) {
    console.error("Organization creation error:", error);
    res.status(500).json({ 
      error: "Failed to create organization",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getOrganization = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (!user.organizationId) {
    return res.status(404).json({ error: "User not associated with any organization" });
  }

  try {
    const organization = await Organization.findById(user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ 
      error: "Failed to get organization",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const inviteTeamMember = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { email, role } = req.body;

  if (!user.organizationId) {
    return res.status(404).json({ error: "User not associated with any organization" });
  }

  if (!email || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user is admin
    const organization = await Organization.findById(user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    // Check if user is admin
    const isAdmin = (organization.adminUsers as Types.ObjectId[]).some(
        (id) => id.toString() === (user as IUser)._id.toString()
      );
      
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Only admin users can invite team members" });
    }
    
    // Check if max users limit is reached
    if (Number(organization.currentUsers) >= Number(organization.maxUsers)) {
      return res.status(400).json({ 
        error: "Maximum user limit reached. Please upgrade your plan or contact support." 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Update existing user
      await User.findByIdAndUpdate(existingUser._id, {
        organizationId: organization._id,
        isEnterprise: true,
        role
      });
      
      // Update organization user count
      await Organization.findByIdAndUpdate(organization._id, {
        $inc: { currentUsers: 1 }
      });
      
      return res.json({ 
        message: "User already exists and has been added to your organization" 
      });
    }
    
    // TODO: Implement invitation system for new users
    // For now, just return a message
    res.json({ 
      message: "Invitation sent to " + email, 
      note: "This is a placeholder. Actual email invitation system needs to be implemented" 
    });
  } catch (error) {
    console.error("Invite team member error:", error);
    res.status(500).json({ 
      error: "Failed to invite team member",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const updateOrganizationSettings = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { settings } = req.body;

  if (!user.organizationId) {
    return res.status(404).json({ error: "User not associated with any organization" });
  }

  try {
    // Check if user is admin
    const organization = await Organization.findById(user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    // Check if user is admin
    const isAdmin = (organization.adminUsers as Types.ObjectId[]).some(id => id.toString() === (user as IUser)._id.toString());

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admin users can update organization settings" });
    }
    
    // Update settings
    const updatedOrg = await Organization.findByIdAndUpdate(
      organization._id,
      { $set: { settings } },
      { new: true }
    );
    
    res.json(updatedOrg);
  } catch (error) {
    console.error("Update organization settings error:", error);
    res.status(500).json({ 
      error: "Failed to update organization settings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};