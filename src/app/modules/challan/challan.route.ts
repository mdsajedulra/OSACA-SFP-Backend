import { Router } from "express";
import { challanController } from "./challan.controller";

const challanRouter = Router();

challanRouter.get("/:challanNo", challanController.getSingleChallan);

export default challanRouter;
