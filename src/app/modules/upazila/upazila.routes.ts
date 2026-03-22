import { Router } from "express";
import { upazilaController } from "./upazila.controller";

const upazilaRouter = Router();

upazilaRouter.post("/", upazilaController.createUpazila);
upazilaRouter.get("/", upazilaController.getAllUpazila);
upazilaRouter.get("/:id", upazilaController.getSingleUpazila);
upazilaRouter.patch("/:id", upazilaController.updateUpazila);
upazilaRouter.delete("/:id", upazilaController.deleteUpazila);

export default upazilaRouter;
