import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { 
  createOrganization, 
  getOrganization, 
  inviteTeamMember,
  updateOrganizationSettings
} from "../controllers/organization.controller";
import { handleErrors } from "../middleware/errors";

const router = express.Router();

router.post(
  "/create", 
  isAuthenticated, 
  handleErrors(createOrganization)
);

router.get(
  "/", 
  isAuthenticated, 
  handleErrors(getOrganization)
);

router.post(
  "/invite", 
  isAuthenticated, 
  handleErrors(inviteTeamMember)
);

router.put(
  "/settings", 
  isAuthenticated, 
  handleErrors(updateOrganizationSettings)
);

export default router;