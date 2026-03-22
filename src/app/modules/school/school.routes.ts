import { Router } from "express";
import { schoolController } from "./school.controller";
import multer from "multer";
import auth from "../../middlewares/auth";

const schoolRouter = Router();

const upload = multer({ dest: "uploads/" });

schoolRouter.post("/", schoolController.createSchool);
schoolRouter.post("/bulk", upload.single("file"), schoolController.bulkSchool);
schoolRouter.get("/", schoolController.getAllSchool);
schoolRouter.patch("/:id", schoolController.updateSchool);
schoolRouter.post("/school-login", schoolController.schoolLogin);
schoolRouter.get("/branch-manager", auth("upazilaManager"), schoolController.getSchoolForBranchManager);

export default schoolRouter;
