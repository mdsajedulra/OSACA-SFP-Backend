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
exports.schoolController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const school_service_1 = require("./school.service");
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("mongoose");
const createSchool = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield school_service_1.schoolService.createSchool(payload);
    (0, sendResponse_1.default)(res, {
        message: "School created Successfully",
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        data: result,
    });
}));
// school login
const schoolLogin = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    // console.log(payload);
    const result = yield school_service_1.schoolService.schoolLogin(payload);
    (0, sendResponse_1.default)(res, {
        message: "School logged in Successfully",
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        data: result,
    });
}));
// get all school
const getAllSchool = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield school_service_1.schoolService.getAllSchool();
    (0, sendResponse_1.default)(res, {
        message: "school get successfully",
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        data: result,
    });
}));
// update school
const updateSchool = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    // console.log(id, req.body);
    const result = yield school_service_1.schoolService.updateSchool(id, req.body);
    (0, sendResponse_1.default)(res, {
        message: "school data update successfully",
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        data: result,
    });
}));
// create bulk school
const bulkSchool = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const workbook = xlsx_1.default.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx_1.default.utils.sheet_to_json(sheet);
    const schools = data.map((row) => {
        var _a;
        return ({
            schoolName: row.schoolName,
            schoolCode: row.schoolCode,
            password: row.password,
            concernMobileNumber: row.concernMobileNumber,
            concernName: row.concernName,
            totalTeacher: Number(row.totalTeacher),
            totalStudent: Number(row.totalStudent),
            // ✅ STRING (URL / link)
            showDetails: ((_a = row.showDetails) === null || _a === void 0 ? void 0 : _a.toString()) || "",
            // ✅ required field
            defaultItems: 0,
            address: {
                upazilaId: new mongoose_1.Types.ObjectId(row.upazilaId),
                union: row.union,
                district: row.district,
            },
        });
    });
    const result = yield school_service_1.schoolService.bulkSchool(schools);
    fs_1.default.unlinkSync(filePath);
    (0, sendResponse_1.default)(res, {
        message: "Schools created successfully",
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        data: result,
    });
}));
exports.schoolController = {
    createSchool,
    schoolLogin,
    getAllSchool,
    updateSchool,
    bulkSchool,
};
