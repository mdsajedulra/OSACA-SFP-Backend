"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const distribution_controller_1 = require("./distribution.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const distributionRouter = (0, express_1.Router)();
distributionRouter.post("/", distribution_controller_1.distributionController.createDistribution);
distributionRouter.get("/", distribution_controller_1.distributionController.getAllDistributions);
distributionRouter.get("/school/:id", distribution_controller_1.distributionController.getDistributionBySchoolIdLast);
distributionRouter.get("/school/report/:schoolId", distribution_controller_1.distributionController.getSchoolDistributionReport);
// distributionRouter.get("/school/:id/:date", distributionController.getDistributionBySchoolIdAndDate)
distributionRouter.patch("/:id", distribution_controller_1.distributionController.updateDistributionById);
distributionRouter.delete("/:id", distribution_controller_1.distributionController.deleteDistributionById);
distributionRouter.get("/branch-manager", (0, auth_1.default)("upazilaManager"), distribution_controller_1.distributionController.getDistributionForBranchManager);
exports.default = distributionRouter;
