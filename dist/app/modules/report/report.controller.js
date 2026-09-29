"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const report_services_1 = require("./report.services");
const form4Report = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    console.log("year", year, "month", month);
    const pdf = yield report_services_1.reportServices.form4Report(year, month);
    (0, sendResponse_1.default)(
    // res.set({
    //   "Content-Type": "application/pdf",
    //   "Content-Disposition": `attachment; filename="form4_report_${year}_${month}.pdf"`,
    //   "Content-Length": pdf.length,
    // }),
    res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Report generated successfully",
        data: pdf,
    });
}));
exports.reportController = {
    form4Report,
};
