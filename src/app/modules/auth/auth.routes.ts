import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "../user/user.validation";
import { authController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { authValidation } from "./auth.validation";

const authrouter = Router();


authrouter.post(
  "/login",
  validateRequest(authValidation.loginValidationSchema),
  authController.login
);

authrouter.post(
  "/change-password",
  auth("admin", "upazilaManager", "monitoringOfficer",),
  validateRequest(authValidation.changePasswordValidationSchema),
  authController.changePassword
);

export default authrouter;