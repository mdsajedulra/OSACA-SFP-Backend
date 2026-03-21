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
exports.distributionController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const distribution_service_1 = require("./distribution.service");
const createDistribution = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_service_1.distributionServices.createDistribution(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Food distribution created successfully",
        data: distribution,
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
exports.distributionController = {
    createDistribution,
    getDistributionById,
    getAllDistributions,
    updateDistributionById,
    deleteDistributionById,
    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast
};
