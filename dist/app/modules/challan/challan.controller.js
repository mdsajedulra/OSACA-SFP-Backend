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
exports.challanController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const formatDate_1 = require("../../utils/formatDate");
const logo_1 = require("../../utils/logo");
const distribution_model_1 = require("../foodDistributions/distribution.model");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const challan_service_1 = require("./challan.service");
const CHROME_PATH = "C:/Users/mdsaj/.cache/puppeteer/chrome-headless-shell/win64-149.0.7827.22/chrome-headless-shell-win64/chrome-headless-shell.exe";
const getSingleChallan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { challanNo } = req.params;
    // ১. DB থেকে আনো
    const challan = yield distribution_model_1.FoodDistribution.findOne({
        "items.challanNo": challanNo,
    })
        .populate({
        path: "schoolId",
        populate: { path: "address.upazilaId", model: "Upazila" },
    })
        .lean();
    if (!challan) {
        return res.status(404).json({ message: "Challan not found" });
    }
    const school = challan === null || challan === void 0 ? void 0 : challan.schoolId;
    const upazila = (_a = school === null || school === void 0 ? void 0 : school.address) === null || _a === void 0 ? void 0 : _a.upazilaId;
    const item = challan === null || challan === void 0 ? void 0 : challan.items.find((i) => i.challanNo == challanNo);
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    // ২. Data বানাও
    const challanData = {
        challanNo: String((_b = item === null || item === void 0 ? void 0 : item.challanNo) !== null && _b !== void 0 ? _b : ""),
        date: (0, formatDate_1.formatDate)(new Date((_c = challan === null || challan === void 0 ? void 0 : challan.date) !== null && _c !== void 0 ? _c : new Date())),
        schoolName: (_d = school === null || school === void 0 ? void 0 : school.schoolNameBangla) !== null && _d !== void 0 ? _d : "",
        schoolCode: (_e = school === null || school === void 0 ? void 0 : school.schoolCode) !== null && _e !== void 0 ? _e : "",
        union: (_g = (_f = school === null || school === void 0 ? void 0 : school.address) === null || _f === void 0 ? void 0 : _f.union) !== null && _g !== void 0 ? _g : "",
        upazila: (_h = upazila === null || upazila === void 0 ? void 0 : upazila.upazilaName) !== null && _h !== void 0 ? _h : "",
        district: (_k = (_j = school === null || school === void 0 ? void 0 : school.address) === null || _j === void 0 ? void 0 : _j.district) !== null && _k !== void 0 ? _k : "",
        foodName: item === null || item === void 0 ? void 0 : item.food,
        quantity: item === null || item === void 0 ? void 0 : item.sent,
        pdOfficeSerial: (_l = school === null || school === void 0 ? void 0 : school.pdOfficeSerial) !== null && _l !== void 0 ? _l : "",
        concernedOfficerName: (_m = upazila === null || upazila === void 0 ? void 0 : upazila.concernedOfficerName) !== null && _m !== void 0 ? _m : "",
        concernedOfficerNumber: (_o = upazila === null || upazila === void 0 ? void 0 : upazila.concernedOfficerNumber) !== null && _o !== void 0 ? _o : "",
        concernedOfficerDesignation: (_p = upazila === null || upazila === void 0 ? void 0 : upazila.concernedOfficerDesignation) !== null && _p !== void 0 ? _p : "",
    };
    // ৩. HTML বানাও
    const logoBase64 = (0, logo_1.getLogoBase64)();
    const html = (0, challan_service_1.buildSingleHTML)(challanData, logoBase64);
    // ৪. Puppeteer দিয়ে PDF বানাও
    const browser = yield puppeteer_core_1.default.launch({
        headless: true,
        executablePath: CHROME_PATH,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
        ],
    });
    try {
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: "domcontentloaded" });
        yield new Promise((r) => setTimeout(r, 300));
        const pdfBuffer = yield page.pdf({
            width: "10in",
            height: "15in",
            printBackground: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });
        // ৫. PDF response পাঠাও
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=challan-${challanNo}.pdf`);
        res.send(Buffer.from(pdfBuffer));
    }
    finally {
        yield browser.close();
    }
}));
exports.challanController = { getSingleChallan };
