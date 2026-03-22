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
exports.distributionServices = void 0;
const school_model_1 = __importDefault(require("../school/school.model"));
const distribution_model_1 = require("./distribution.model");
const user_model_1 = require("../user/user.model");
const mongoose_1 = require("mongoose");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// create distribution service function 
const createDistribution = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.default.findById(payload.schoolId);
    if (!school) {
        throw new Error("School not found");
    }
    // existing distribution check
    let distribution = yield distribution_model_1.FoodDistribution.findOne({
        schoolId: payload.schoolId,
        date: payload.date,
    });
    if (distribution) {
        // 🔥 duplicate food check
        const existingFoods = distribution.items.map((item) => item.food.toLowerCase());
        for (const newItem of payload.items) {
            if (existingFoods.includes(newItem.food.toLowerCase())) {
                throw new Error(`Food "${newItem.food}" already exists for this date`);
            }
        }
        // ✅ push new items
        distribution.items.push(...payload.items);
        yield distribution.save();
        return distribution;
    }
    // ✅ new distribution create
    const newDistribution = yield distribution_model_1.FoodDistribution.create(payload);
    return newDistribution;
});
// get all distribution
const getAllDistributions = () => __awaiter(void 0, void 0, void 0, function* () {
    const distributions = yield distribution_model_1.FoodDistribution.find().populate("schoolId").populate("upazilaId");
    return distributions;
});
// get distribution by id
const getDistributionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_model_1.FoodDistribution.findById(id);
    return distribution;
});
// update distribution by id
const updateDistributionById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_model_1.FoodDistribution.findByIdAndUpdate(id, payload, { new: true });
    return distribution;
});
// delete distribution by id
const deleteDistributionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield distribution_model_1.FoodDistribution.findByIdAndDelete(id);
    return;
});
// get distribution by school id and date 
const getDistributionBySchoolAndDate = (schoolId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_model_1.FoodDistribution.findOne({ schoolId, date });
    return distribution;
});
// get distribution by school id
const getDistributionBySchoolIdLast = (schoolId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(schoolId);
    const startOfDay = (0, moment_timezone_1.default)().startOf("day").toDate();
    const endOfDay = (0, moment_timezone_1.default)().endOf("day").toDate();
    const data = yield distribution_model_1.FoodDistribution.findOne({
        schoolId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["submitted", "confirmed"] },
    })
        .sort({ createdAt: -1 });
    return data;
});
// branch manager get distribution for their upazila 
const getDistributionForBranchManager = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const upazilaManager = yield user_model_1.User.findOne({ email })
        .populate("accessUpazila"); // typeScript ignore for now
    const upazilaIdRaw = (_a = upazilaManager === null || upazilaManager === void 0 ? void 0 : upazilaManager.accessUpazila) === null || _a === void 0 ? void 0 : _a._id;
    if (!upazilaIdRaw) {
        throw new Error("This user has no accessUpazila assigned or populate failed");
    }
    // convert string/ObjectId safely
    const upazilaId = typeof upazilaIdRaw === "string" ? new mongoose_1.Types.ObjectId(upazilaIdRaw) : upazilaIdRaw;
    console.log("Querying for Upazila ID:", upazilaId);
    const distribution = yield distribution_model_1.FoodDistribution.find({ upazilaId }).populate("schoolId").populate("upazilaId"); // populate school name and address
    console.log("Distribution found:", distribution.length);
    return distribution;
});
exports.distributionServices = {
    createDistribution,
    getAllDistributions,
    getDistributionById,
    updateDistributionById,
    deleteDistributionById,
    getDistributionBySchoolAndDate,
    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast
};
