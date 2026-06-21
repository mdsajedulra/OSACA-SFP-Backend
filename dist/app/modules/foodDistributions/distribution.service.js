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
const distribution_report_1 = require("./distribution.report");
const challanNumber_1 = require("../../utils/challanNumber");
const gerationBatch_mode_1 = require("../challanJob/gerationBatch.mode");
const pdfJob_model_1 = __importDefault(require("../challanJob/pdfJob.model"));
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
// create bulk distribution service function
const createBulkDistribution = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createdDistributions = [];
    for (const distributionData of payload) {
        const distribution = yield createDistribution(distributionData);
        createdDistributions.push(distribution);
    }
    return createdDistributions;
});
// get all distribution
const getAllDistributions = () => __awaiter(void 0, void 0, void 0, function* () {
    const distributions = yield distribution_model_1.FoodDistribution.find()
        .populate("schoolId")
        .populate("upazilaId");
    return distributions;
});
// get distribution by id
const getDistributionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_model_1.FoodDistribution.findById(id);
    return distribution;
});
// update distribution by id
const updateDistributionById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield distribution_model_1.FoodDistribution.findByIdAndUpdate(id, payload, {
        new: true,
    });
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
    const objectId = new mongoose_1.Types.ObjectId(schoolId);
    const startOfDay = (0, moment_timezone_1.default)().startOf("day").toDate();
    const endOfDay = (0, moment_timezone_1.default)().endOf("day").toDate();
    // 🔹 Step 1: Try to get today's data
    const todayData = yield distribution_model_1.FoodDistribution.findOne({
        schoolId: objectId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["submitted", "confirmed"] },
    }).sort({ createdAt: -1 });
    if (todayData) {
        return todayData; // ✅ আজকেরটাই return
    }
    // 🔹 Step 2: না থাকলে past থেকে latest data (future বাদ)
    const lastData = yield distribution_model_1.FoodDistribution.findOne({
        schoolId,
        date: { $lt: startOfDay }, //  future বাদ
        status: { $in: ["submitted", "confirmed"] },
    }).sort({ date: -1 });
    return lastData;
});
// branch manager get distribution for their upazila
const getDistributionForBranchManager = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const upazilaManager = yield user_model_1.User.findOne({ email }).populate("accessUpazila"); // typeScript ignore for now
    const upazilaIdRaw = (_a = upazilaManager === null || upazilaManager === void 0 ? void 0 : upazilaManager.accessUpazila) === null || _a === void 0 ? void 0 : _a._id;
    if (!upazilaIdRaw) {
        throw new Error("This user has no accessUpazila assigned or populate failed");
    }
    // convert string/ObjectId safely
    const upazilaId = typeof upazilaIdRaw === "string"
        ? new mongoose_1.Types.ObjectId(upazilaIdRaw)
        : upazilaIdRaw;
    console.log("Querying for Upazila ID:", upazilaId);
    const distribution = yield distribution_model_1.FoodDistribution.find({ upazilaId })
        .populate("schoolId")
        .populate("upazilaId"); // populate school name and address
    console.log("Distribution found:", distribution.length);
    return distribution;
});
const getSchoolDistributionMonthlyReportService = (schoolId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, distribution_report_1.getSchoolDistributionMonthlyReport)(schoolId, month, year);
});
const exportSchoolDistributionMonthlyReportService = (payload, format, period) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, distribution_report_1.exportSchoolDistributionMonthlyReport)(payload, format, period);
});
/// creata all entry and generate pdf from here
const MENU = {
    0: ["bread", "egg"], // রবিবার   → বনরুটি + সিদ্ধ ডিম
    1: ["bread"], // সোমবার   → বনরুটি
    2: ["banana"], // মঙ্গলবার → কলা
    3: ["bread", "egg"], // বুধবার   → বনরুটি + সিদ্ধ ডিম
    4: ["bread", "egg"], // বৃহস্পতি → বনরুটি + সিদ্ধ ডিম
    5: [], // শুক্রবার → অফ
    6: ["bread", "egg"], // শনিবার   → বনরুটি + সিদ্ধ ডিম
};
const FOOD_NAME = {
    bread: "বনরুটি",
    egg: "সিদ্ধ ডিম",
    banana: "কলা",
};
// ============================================
// একটা তারিখের জন্য items বানাও
// ============================================
function getItemsForDate(date, 
// studentCount: number,
currentNo, defaultItems) {
    const day = date.getDay(); // 0=রবি, 1=সোম ... 6=শনি
    console.log(day);
    const foods = MENU[day]; // সেদিনের খাবারের key list
    // শুক্রবার → foods = [] → map করলে [] আসবে
    return foods.map((key) => ({
        food: FOOD_NAME[key],
        sent: defaultItems !== null && defaultItems !== void 0 ? defaultItems : 1, // প্রতিটা ছাত্রের জন্য ১ পিস
        received: 0, // পরে update হবে
        challanNo: (0, challanNumber_1.formatChallanNo)(currentNo.value++),
    }));
}
const createAllEntry = (selectedDates, submittedBy) => __awaiter(void 0, void 0, void 0, function* () {
    //  async function bulkGenerate(
    //   selectedDates: string[], // ← এটাই বদলালো
    //   submittedBy: string,
    // ) {
    const batchName = Date.now().toString();
    const batch = yield gerationBatch_mode_1.generationBatchModel.create({
        name: batchName,
        selectedDates: selectedDates.map((d) => new Date(d)),
        status: "processing",
        generatedBy: submittedBy,
    });
    const schools = yield school_model_1.default.find().lean();
    let totalItems = 0;
    for (const school of schools) {
        for (const dateStr of selectedDates) {
            const dow = new Date(dateStr).getDay();
            totalItems += MENU[dow].length;
        }
    }
    // ২. DB থেকে শুরুর নম্বর নাও
    const firstNo = yield (0, challanNumber_1.reserveChallanBlock)(totalItems);
    // ৩. currentNo object বানাও ← এইটুকুই
    const currentNo = { value: firstNo };
    const allDocs = [];
    for (const school of schools) {
        for (const dateStr of selectedDates) {
            // ← selected dates এ লুপ
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            const items = getItemsForDate(date, 
            // school.numberOfStudent,
            currentNo, school === null || school === void 0 ? void 0 : school.defaultItems);
            if (items.length === 0)
                continue; // শুক্রবার automatically skip
            allDocs.push({
                schoolId: school._id,
                upazilaId: school.address.upazilaId,
                date,
                days: 1,
                items,
                status: "submitted",
                submittedBy,
                batchId: batch === null || batch === void 0 ? void 0 : batch._id,
            });
        }
    }
    // বাকি insertMany একই থাকবে
    // const CHUNK = 5000;
    // let inserted = 0;
    // for (let i = 0; i < allDocs.length; i += CHUNK) {
    //   const chunk = allDocs.slice(i, i + CHUNK);
    //   await FoodDistribution.insertMany(chunk, { ordered: false });
    //   inserted += chunk.length;
    // }
    const insertedDocs = yield distribution_model_1.FoodDistribution.insertMany(allDocs, {
        ordered: false,
    });
    // creating batch on batch collection  DB
    yield batch.updateOne({
        status: "done",
        totalSchools: schools.length,
        totalDistributions: insertedDocs.length,
        totalChallans: totalItems,
        challanRange: {
            from: (0, challanNumber_1.formatChallanNo)(firstNo),
            to: (0, challanNumber_1.formatChallanNo)(firstNo + totalItems - 1),
        },
    });
    return {
        // totalSchools: schools.length,
        // totalDocs: allDocs.length,
        // inserted,
        all: allDocs.length,
        inserted: insertedDocs.length,
        insertedDocs,
    };
});
// pdf generation from here
const startPdfWorker = (batchId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pdfJob_model_1.default.create({ batchId });
    if (!result) {
        throw new Error("Failed to create PDF job");
    }
    return "pdf generation started";
});
exports.distributionServices = {
    createDistribution,
    createBulkDistribution,
    getAllDistributions,
    getDistributionById,
    updateDistributionById,
    deleteDistributionById,
    getDistributionBySchoolAndDate,
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast,
    getSchoolDistributionMonthlyReport: getSchoolDistributionMonthlyReportService,
    exportSchoolDistributionMonthlyReport: exportSchoolDistributionMonthlyReportService,
    createAllEntry,
    startPdfWorker,
};
