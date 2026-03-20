import { Router } from "express";
import { distributionController } from "./distribution.controller";

const distributionRouter = Router();


distributionRouter.post("/",  distributionController.createDistribution)
distributionRouter.get("/", distributionController.getAllDistributions)
distributionRouter.get("/:id", distributionController.getDistributionById)
distributionRouter.patch("/:id", distributionController.updateDistributionById)
distributionRouter.delete("/:id", distributionController.deleteDistributionById)

export default distributionRouter;