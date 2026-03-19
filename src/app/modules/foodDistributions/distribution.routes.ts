import { Router } from "express";
import { distributionController } from "./distribution.controller";

const distributionRouter = Router();


distributionRouter.post("/",  distributionController.createDistribution)
distributionRouter.get("/:id", distributionController.getDistributionById)


export default distributionRouter;