import { Router } from "express";
import { schoolController } from "./school.controller";
import multer from "multer";
import auth from "../../middlewares/auth";

const schoolRouter = Router();

const upload = multer({ dest: "uploads/" });

schoolRouter.post("/", schoolController.createSchool);
schoolRouter.post("/bulk", upload.single("file"), schoolController.bulkSchool);
schoolRouter.patch("/bulk", upload.single("file"), schoolController.bulkSchoolUpdate);

schoolRouter.get("/", schoolController.getAllSchool);
schoolRouter.get("/", schoolController.getAllSchoolNotOptimized);

schoolRouter.get("/:schoolId", schoolController.getSchoolById);

schoolRouter.patch("/:id", schoolController.updateSchool);
schoolRouter.delete("/:id", schoolController.deleteSchool);

schoolRouter.post("/school-login", schoolController.schoolLogin);
schoolRouter.get("/school_by/upazila_manager", auth("upazilaManager"), schoolController.getSchoolForBranchManager);

export default schoolRouter;
