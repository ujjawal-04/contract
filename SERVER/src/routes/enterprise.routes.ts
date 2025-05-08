import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { isEnterpriseUser, isOrgAdmin, isOrgManager } from "../middleware/enterprise"
import { 
    createOrganization,
    inviteTeamMember,
    shareContractWithTeam,
    getOrganizationContracts,
    createEnterpriseSubscription
} from "../controllers/enterprise.controller";
import { handleErrors } from "../middleware/errors";

const router = express.Router();

// Organization creation and management
router.post(
    "/create-organization",
    isAuthenticated,
    handleErrors(createOrganization)
);

router.post(
    "/invite",
    isAuthenticated,
    isOrgAdmin,
    handleErrors(inviteTeamMember)
);

// Contract sharing and collaboration
router.post(
    "/share-contract",
    isAuthenticated,
    isEnterpriseUser,
    handleErrors(shareContractWithTeam)
);

router.get(
    "/org-contracts",
    isAuthenticated,
    isEnterpriseUser,
    handleErrors(getOrganizationContracts)
);

// Billing and subscription
router.post(
    "/create-subscription",
    isAuthenticated,
    isOrgAdmin,
    handleErrors(createEnterpriseSubscription)
);

export default router;