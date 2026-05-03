"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_validation_1 = require("./auth.validation");
const authrouter = (0, express_1.Router)();
authrouter.post("/login", (0, validateRequest_1.default)(auth_validation_1.authValidation.loginValidationSchema), auth_controller_1.authController.login);
authrouter.post("/change-password", (0, auth_1.default)("admin", "upazilaManager", "monitoringOfficer"), (0, validateRequest_1.default)(auth_validation_1.authValidation.changePasswordValidationSchema), auth_controller_1.authController.changePassword);
exports.default = authrouter;
