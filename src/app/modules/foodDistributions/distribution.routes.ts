import { Router } from "express";
import { distributionController } from "./distribution.controller";
import auth from "../../middlewares/auth";

const distributionRouter = Router();

distributionRouter.post("/",  distributionController.createDistribution)
distributionRouter.post("/bulk",  distributionController.createBulkDistribution)

distributionRouter.get("/", distributionController.getAllDistributions)
distributionRouter.get("/school/:id", distributionController.getDistributionBySchoolIdLast)
distributionRouter.get("/school/report/:schoolId", distributionController.getSchoolDistributionReport)


// distributionRouter.get("/school/:id/:date", distributionController.getDistributionBySchoolIdAndDate)
distributionRouter.patch("/:id", distributionController.updateDistributionById)
distributionRouter.delete("/:id", distributionController.deleteDistributionById)
distributionRouter.get("/branch-manager", auth("upazilaManager"), distributionController.getDistributionForBranchManager)

// distribution bulk insert and generate pdf work from here 

distributionRouter.post('/createallentry', auth("admin"), distributionController.createAllEntry)
distributionRouter.post('/generate-pdf', distributionController.generatePdf)


export default distributionRouter;