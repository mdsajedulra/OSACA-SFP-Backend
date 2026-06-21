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
exports.distributionController = exports.getSchoolDistributionReport = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const distribution_service_1 = require("./distribution.service");
const mongoose_1 = require("mongoose");
const user_model_1 = require("../user/user.model");
const createDistribution = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_service_1.distributionServices.createDistribution(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Food distribution created successfully",
        data: distribution,
    });
}));
// create bulk distribution
const createBulkDistribution = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distributions = yield distribution_service_1.distributionServices.createBulkDistribution(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Food distributions created successfully",
        data: distributions,
    });
}));
// get all distribution
const getAllDistributions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distributions = yield distribution_service_1.distributionServices.getAllDistributions();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Food distributions retrieved successfully",
        data: distributions,
    });
}));
// get distribution by id
const getDistributionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_service_1.distributionServices.getDistributionById(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Distribution found successfully",
        data: distribution,
    });
}));
// update distribution by id
const updateDistributionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_service_1.distributionServices.updateDistributionById(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Distribution updated successfully",
        data: distribution,
    });
}));
// delete distribution by id
const deleteDistributionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield distribution_service_1.distributionServices.deleteDistributionById(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Distribution deleted successfully",
    });
}));
// get distribution by school id
const getDistributionBySchoolIdLast = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_service_1.distributionServices.getDistributionBySchoolIdLast(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Distribution found successfully",
        data: distribution,
    });
}));
// get
// get distribution for branch manager
const getDistributionForBranchManager = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    console.log(user);
    const distributions = yield distribution_service_1.distributionServices.getDistributionForBranchManager(user === null || user === void 0 ? void 0 : user.email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Distributions retrieved successfully",
        data: distributions,
    });
}));
//
exports.getSchoolDistributionReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const schoolId = String(req.params.schoolId);
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    const type = String((_a = req.query.type) !== null && _a !== void 0 ? _a : "").toLowerCase();
    if (!mongoose_1.Types.ObjectId.isValid(schoolId)) {
        throw new Error("Invalid schoolId");
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new Error('Query "month" must be an integer from 1 to 12');
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        throw new Error('Query "year" must be a valid year');
    }
    if (type !== "pdf" && type !== "docx") {
        throw new Error('Query "type" must be pdf or docx');
    }
    const payload = yield distribution_service_1.distributionServices.getSchoolDistributionMonthlyReport(schoolId, month, year);
    const { buffer, contentType, filename } = yield distribution_service_1.distributionServices.exportSchoolDistributionMonthlyReport(payload, type, { year, month });
    const body = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    res.status(http_status_codes_1.StatusCodes.OK);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(body.length));
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.end(body);
}));
// bulk entry and pdf generation
const createAllEntry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // console.log(req.user)
    const user = yield user_model_1.User.findOne({ email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }).lean();
    if (!user) {
        throw new Error("User not found");
    }
    // console.log(user);
    const selectedDate = req.body.selectedDates;
    if (!selectedDate) {
        throw new Error("selectedDates is required in the request body");
    }
    const result = yield distribution_service_1.distributionServices.createAllEntry(selectedDate, String(user._id));
    (0, sendResponse_1.default)(res, {
        message: "all data create",
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        data: result,
    });
}));
const generatePdf = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { batchId } = req.body;
    const result = yield distribution_service_1.distributionServices.startPdfWorker(batchId);
    (0, sendResponse_1.default)(res, {
        message: "PDF generated successfully",
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        data: result,
    });
}));
exports.distributionController = {
    createDistribution,
    createBulkDistribution,
    getDistributionById,
    getAllDistributions,
    updateDistributionById,
    deleteDistributionById,
    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast,
    getSchoolDistributionReport: exports.getSchoolDistributionReport,
    createAllEntry,
    generatePdf,
};
