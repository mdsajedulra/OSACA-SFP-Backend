import { Router } from "express";
import { reportController } from "./report.controller";

const reportRoutes = Router();

reportRoutes.get("/form4", reportController.form4Report );


export default reportRoutes;