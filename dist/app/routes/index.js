"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("../modules/user/user.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const school_routes_1 = __importDefault(require("../modules/school/school.routes"));
const contactInfo_routes_1 = __importDefault(require("../modules/contactinfo/contactInfo.routes"));
const upazila_routes_1 = __importDefault(require("../modules/upazila/upazila.routes"));
const distribution_routes_1 = __importDefault(require("../modules/foodDistributions/distribution.routes"));
const challan_route_1 = __importDefault(require("../modules/challan/challan.route"));
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_routes_1.default,
    },
    {
        path: "/auth",
        route: auth_routes_1.default,
    },
    {
        path: "/upazila",
        route: upazila_routes_1.default,
    },
    {
        path: "/school",
        route: school_routes_1.default,
    },
    {
        path: "/distribution",
        route: distribution_routes_1.default,
    },
    {
        path: "/contactinfo",
        route: contactInfo_routes_1.default,
    },
    {
        path: "/challan",
        route: challan_route_1.default,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
