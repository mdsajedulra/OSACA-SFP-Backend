"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const reportRoutes = (0, express_1.Router)();
reportRoutes.get("/form4", report_controller_1.reportController.form4Report);
exports.default = reportRoutes;
