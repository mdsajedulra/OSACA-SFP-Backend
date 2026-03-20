import { Router } from "express";
import { distributionController } from "./distribution.controller";
import auth from "../../middlewares/auth";

const distributionRouter = Router();

distributionRouter.post("/",  distributionController.createDistribution)
distributionRouter.get("/", distributionController.getAllDistributions)
distributionRouter.get("/school/:id", distributionController.getDistributionBySchoolIdLast)
// distributionRouter.get("/school/:id/:date", distributionController.getDistributionBySchoolIdAndDate)
distributionRouter.patch("/:id", distributionController.updateDistributionById)
distributionRouter.delete("/:id", distributionController.deleteDistributionById)
distributionRouter.get("/branch-manager", auth("upazilaManager"), distributionController.getDistributionForBranchManager)

export default distributionRouter;