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
exports.schoolService = void 0;
const school_model_1 = __importDefault(require("./school.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../user/user.model");
const createSchool = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield school_model_1.default.create(payload);
    return result;
});
const schoolLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const school = yield school_model_1.default.find({
        schoolCode: payload.schoolCode,
    });
    if (school.length === 0) {
        throw new Error("School Not Found");
    }
    if (school[0].password !== payload.password) {
        throw new Error("Invalid Password");
    }
    console.log(school);
    return school[0];
});
// get all schools
const getAllSchool = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield school_model_1.default.find();
    return result;
});
// update school data
const updateSchool = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const result = yield school_model_1.default.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return result;
});
// create bulk school
const bulkSchool = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield school_model_1.default.insertMany(payload, { ordered: false });
    if (result.length == 0)
        throw new Error("Some went wrong, check exel file");
    return result;
});
const getSchoolForBranchManager = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const upazilaManager = yield user_model_1.User.findOne({ email: email }).populate('accessUpazila');
    console.log((_a = upazilaManager === null || upazilaManager === void 0 ? void 0 : upazilaManager.accessUpazila) === null || _a === void 0 ? void 0 : _a._id);
    const school = yield school_model_1.default.find({
        "address.upazilaId": new mongoose_1.default.Types.ObjectId((_b = upazilaManager === null || upazilaManager === void 0 ? void 0 : upazilaManager.accessUpazila) === null || _b === void 0 ? void 0 : _b._id),
    });
    return school;
});
exports.schoolService = {
    createSchool,
    schoolLogin,
    getAllSchool,
    updateSchool,
    bulkSchool,
    getSchoolForBranchManager
};
