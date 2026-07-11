import { Router } from "express";
import userRoute from "../modules/user/user.routes";
import authrouter from "../modules/auth/auth.routes";
import schoolRouter from "../modules/school/school.routes";

import contactInfoRouter from "../modules/contactinfo/contactInfo.routes";
import upazilaRouter from "../modules/upazila/upazila.routes";
import distributionRouter from "../modules/foodDistributions/distribution.routes";
import challanRouter from "../modules/challan/challan.route";
import reportRoutes from "../modules/report/report.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authrouter,
  },
  {
    path: "/upazila",
    route: upazilaRouter,
  },
  {
    path: "/school",
    route: schoolRouter,
  },
  {
    path: "/distribution",
    route: distributionRouter,
  },
  {
    path: "/contactinfo",
    route: contactInfoRouter,
  },
  {
    path: "/challan",
    route: challanRouter,
  },
  {
    path: "/report",
    route: reportRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
