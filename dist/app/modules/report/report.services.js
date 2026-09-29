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
exports.reportServices = void 0;
const getBDMonthRange_1 = require("../../utils/getBDMonthRange");
const distribution_model_1 = require("../foodDistributions/distribution.model");
const htmltoPdf_1 = __importDefault(require("./htmltoPdf"));
const savePdf_1 = __importDefault(require("./savePdf"));
const form04_template_1 = __importDefault(require("./templates/form04.template"));
const form4Report = (year, month) => __awaiter(void 0, void 0, void 0, function* () {
    const { start, end } = (0, getBDMonthRange_1.getBdMonthRange)(year, month);
    console.log(start, end);
    const distributions = yield distribution_model_1.FoodDistribution.aggregate([
        {
            $match: {
                date: { $gte: start, $lte: end },
            },
        },
        { $sort: { date: 1 } },
        {
            $group: {
                _id: "$schoolId",
                distributions: { $push: "$$ROOT" },
                totalCount: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: "schools",
                localField: "_id",
                foreignField: "_id",
                as: "school",
            },
        },
        { $unwind: "$school" },
        { $sort: { "school.name": 1 } },
        // $unwind: "$school" এর পরে
        {
            $lookup: {
                from: "upazilas", // তোমার upazila collection নাম
                localField: "school.address.upazilaId",
                foreignField: "_id",
                as: "upazila",
            },
        },
        { $unwind: { path: "$upazila", preserveNullAndEmptyArrays: true } },
    ]);
    const html = (0, form04_template_1.default)(distributions, month, year);
    const pdf = yield (0, htmltoPdf_1.default)(html);
    const filepath = (0, savePdf_1.default)(pdf, "form4");
    return filepath;
});
exports.reportServices = {
    form4Report,
};
