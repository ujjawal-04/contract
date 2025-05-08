import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";

// Middleware to check if user is part of an enterprise
export const isEnterpriseUser = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser;
    
    if (user.isEnterprise && user.organizationId) {
        next();
        return;
    }
    
    res.status(403).json({ 
        success: false, 
        message: 'This feature requires an enterprise account' 
    });
};

// Middleware to check if user is an organization admin
export const isOrgAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser;
    
    if (user.isEnterprise && user.organizationId && user.role === 'admin') {
        next();
        return;
    }
    
    res.status(403).json({ 
        success: false, 
        message: 'This action requires admin privileges' 
    });
};

// Middleware to check if user is an organization admin or manager
export const isOrgManager = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser;
    
    if (user.isEnterprise && user.organizationId && (user.role === 'admin' || user.role === 'manager')) {
        next();
        return;
    }
    
    res.status(403).json({ 
        success: false, 
        message: 'This action requires admin or manager privileges' 
    });
};
