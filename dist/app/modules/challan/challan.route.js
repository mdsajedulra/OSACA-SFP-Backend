"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challan_controller_1 = require("./challan.controller");
const challanRouter = (0, express_1.Router)();
challanRouter.get("/:challanNo", challan_controller_1.challanController.getSingleChallan);
exports.default = challanRouter;
