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
exports.exportSchoolDistributionMonthlyReport = exports.getSchoolDistributionMonthlyReport = exports.FORM_COLORS = void 0;
exports.toBengaliNumeralString = toBengaliNumeralString;
exports.monthNameBn = monthNameBn;
exports.buildSchoolDistributionMonthDocx = buildSchoolDistributionMonthDocx;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// import puppeteer from "puppeteer";
const mongoose_1 = require("mongoose");
const docx_1 = require("docx");
const distribution_model_1 = require("./distribution.model");
const school_model_1 = __importDefault(require("../school/school.model"));
exports.FORM_COLORS = {
    headerLight: "#D0D0D0",
    headerChallan: "#D0D0D0",
    indexGreen: "#DDE9D4",
    totalRow: "#D0D0D0",
};
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const MONTHS_BN = [
    "",
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
];
function toBengaliNumeralString(n) {
    return String(n)
        .split("")
        .map((d) => { var _a; return (_a = BN_DIGITS[parseInt(d, 10)]) !== null && _a !== void 0 ? _a : d; })
        .join("");
}
function monthNameBn(month1to12) {
    var _a;
    return (_a = MONTHS_BN[month1to12]) !== null && _a !== void 0 ? _a : "";
}
function toBanglaText(value) {
    if (value === null || value === undefined)
        return "";
    return toBengaliNumeralString(String(value));
}
function toBanglaDate(date) {
    return toBengaliNumeralString((0, moment_timezone_1.default)(date).tz("Asia/Dhaka").format("DD/MM/YYYY"));
}
function toBanglaMixedText(value) {
    if (!value)
        return "";
    return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}
function resolveFoodColumn(food) {
    const f = String(food || "").toLowerCase().trim();
    if (f.includes("banruti") ||
        f.includes("bun") ||
        f.includes("bread") ||
        /বনরুটি|বানরুটি/.test(food)) {
        return "banruti";
    }
    if (f.includes("egg") || f.includes("boiled") || /ডিম/.test(food)) {
        return "egg";
    }
    if (f.includes("banana") || /কলা/.test(food)) {
        return "banana";
    }
    if (f.includes("biscuit") ||
        f.includes("fortified") ||
        /বিস্কুট/.test(food)) {
        return "biscuit";
    }
    if (f.includes("milk") || f.includes("uht") || /দুধ/.test(food)) {
        return "milk";
    }
    return null;
}
function emptyFoodCols() {
    return { banruti: 0, egg: 0, banana: 0, biscuit: 0, milk: 0 };
}
function escapeHtml(text) {
    return String(text !== null && text !== void 0 ? text : "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function banglaToEnglishDigits(value) {
    const map = {
        "০": "0",
        "১": "1",
        "২": "2",
        "৩": "3",
        "৪": "4",
        "৫": "5",
        "৬": "6",
        "৭": "7",
        "৮": "8",
        "৯": "9",
    };
    return String(value || "").replace(/[০-৯]/g, (d) => { var _a; return (_a = map[d]) !== null && _a !== void 0 ? _a : d; });
}
const getSchoolDistributionMonthlyReport = (schoolId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!mongoose_1.Types.ObjectId.isValid(schoolId)) {
        throw new Error("Invalid school id");
    }
    const school = yield school_model_1.default
        .findById(schoolId)
        .populate("address.upazilaId")
        .lean();
    if (!school) {
        throw new Error("School not found");
    }
    const upDoc = (_a = school.address) === null || _a === void 0 ? void 0 : _a.upazilaId;
    const upazilaName = typeof upDoc === "object" && upDoc && "upazilaName" in upDoc
        ? String((_b = upDoc.upazilaName) !== null && _b !== void 0 ? _b : "")
        : "";
    const start = moment_timezone_1.default
        .tz({ year, month: month - 1, day: 1 }, "Asia/Dhaka")
        .startOf("month")
        .toDate();
    const end = moment_timezone_1.default
        .tz({ year, month: month - 1, day: 1 }, "Asia/Dhaka")
        .endOf("month")
        .toDate();
    const distributions = yield distribution_model_1.FoodDistribution.find({
        schoolId: new mongoose_1.Types.ObjectId(schoolId),
        date: { $gte: start, $lte: end },
        status: { $in: ["submitted", "confirmed"] },
    })
        .sort({ date: 1, createdAt: 1 })
        .lean();
    const table = [];
    for (let index = 0; index < 31; index++) {
        const serialBn = toBengaliNumeralString(index + 1);
        const dist = distributions[index];
        if (!dist) {
            table.push({
                serialBn,
                receiptDate: "",
                challanNo: "",
                challanDate: "",
                banruti: "",
                egg: "",
                banana: "",
                biscuit: "",
                milk: "",
                signature: "",
                remark: "",
            });
            continue;
        }
        const receipt = toBanglaDate(dist.date);
        const cols = emptyFoodCols();
        for (const item of (_c = dist.items) !== null && _c !== void 0 ? _c : []) {
            const k = resolveFoodColumn(item.food);
            if (k) {
                const received = Number(item.received) || 0;
                const sent = Number(item.sent) || 0;
                cols[k] += received > 0 ? received : sent;
            }
        }
        const challan = toBanglaMixedText(String((_d = dist.challan) !== null && _d !== void 0 ? _d : ""));
        table.push({
            serialBn,
            receiptDate: receipt,
            challanNo: challan,
            challanDate: receipt,
            banruti: cols.banruti ? toBanglaText(cols.banruti) : "",
            egg: cols.egg ? toBanglaText(cols.egg) : "",
            banana: cols.banana ? toBanglaText(cols.banana) : "",
            biscuit: cols.biscuit ? toBanglaText(cols.biscuit) : "",
            milk: cols.milk ? toBanglaText(cols.milk) : "",
            signature: "",
            remark: toBanglaMixedText((_f = (_e = dist.remark) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : ""),
        });
    }
    const sumCols = emptyFoodCols();
    for (const row of table) {
        Object.keys(sumCols).forEach((k) => {
            const englishDigits = banglaToEnglishDigits(String(row[k] || ""));
            const n = parseInt(englishDigits, 10);
            if (!Number.isNaN(n))
                sumCols[k] += n;
        });
    }
    return {
        schoolNameBn: school.schoolNameBangla || school.schoolName || "",
        emisCode: toBanglaText(school.schoolCode || ""),
        district: toBanglaMixedText((_h = (_g = school.address) === null || _g === void 0 ? void 0 : _g.district) !== null && _h !== void 0 ? _h : ""),
        upazila: toBanglaMixedText(upazilaName),
        union: toBanglaMixedText((_k = (_j = school.address) === null || _j === void 0 ? void 0 : _j.union) !== null && _k !== void 0 ? _k : ""),
        cluster: "",
        monthBn: monthNameBn(month),
        yearBn: toBanglaText(year),
        headTeacherPhoneNumber: toBanglaText(school.headTeacherPhoneNumber || ""),
        tifinManagerNumber: toBanglaText(school.tifinManagerNumber ||
            school.tifinManagerPNumber ||
            ""),
        table,
        totals: {
            banruti: sumCols.banruti ? toBanglaText(sumCols.banruti) : "",
            egg: sumCols.egg ? toBanglaText(sumCols.egg) : "",
            banana: sumCols.banana ? toBanglaText(sumCols.banana) : "",
            biscuit: sumCols.biscuit ? toBanglaText(sumCols.biscuit) : "",
            milk: sumCols.milk ? toBanglaText(sumCols.milk) : "",
        },
    };
});
exports.getSchoolDistributionMonthlyReport = getSchoolDistributionMonthlyReport;
function buildPdfHtml(payload) {
    const rowsHtml = payload.table
        .map((row) => `
      <tr>
        <td class="c">${escapeHtml(row.serialBn)}</td>
        <td class="l">${escapeHtml(row.receiptDate)}</td>
        <td class="c">${escapeHtml(row.challanNo)}</td>
        <td class="c">${escapeHtml(row.challanDate)}</td>
        <td class="c">${escapeHtml(row.banruti)}</td>
        <td class="c">${escapeHtml(row.egg)}</td>
        <td class="c">${escapeHtml(row.banana)}</td>
        <td class="c">${escapeHtml(row.biscuit)}</td>
        <td class="c">${escapeHtml(row.milk)}</td>
        <td class="c">${escapeHtml(row.signature)}</td>
        <td class="c">${escapeHtml(row.remark)}</td>
      </tr>
    `)
        .join("");
    return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>Monthly Food Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&display=swap');

    * {
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 6mm;
    }

    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Noto Serif Bengali', serif;
      color: #000;
      font-size: 8.2px;
      line-height: 1.05;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 198mm;
      height: 285mm;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
    }

    .form-no {
      text-align: right;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 42px;
    }

    .title {
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .subtitle {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .period {
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .period-line {
      display: inline-block;
      min-width: 120px;
      border-bottom: 1px solid #000;
      text-align: center;
      line-height: 1;
      padding-bottom: 1px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .info-table {
      margin-bottom: 0;
    }

    .info-table td {
      border: 1px solid #000;
      padding: 2px 6px;
      vertical-align: middle;
      font-size: 8.4px;
      font-weight: 700;
      height: 22px;
    }

    .main-table {
      border: 1px solid #000;
      margin-top: 0;
    }

    .main-table th,
    .main-table td {
      border: 1px solid #000;
      padding: 1px 2px;
      text-align: center;
      vertical-align: middle;
      word-wrap: break-word;
      overflow-wrap: break-word;
      font-size: 7.1px;
      height: 16px;
    }

    .main-table thead th {
      font-weight: 700;
    }

    .main-table .hlight {
      background: ${exports.FORM_COLORS.headerLight};
      font-weight: 700;
    }

    .main-table .hchallan {
      background: ${exports.FORM_COLORS.headerChallan};
      font-weight: 700;
    }

    .main-table .hgreen {
      background: ${exports.FORM_COLORS.indexGreen};
      font-weight: 700;
    }

    .main-table .htotal td {
      background: ${exports.FORM_COLORS.totalRow};
      font-weight: 700;
      height: 18px;
    }

    .c { text-align: center; }
    .l { text-align: left; }

    .h1 th {
      height: 34px;
      font-size: 7.7px;
    }

    .h2 th {
      height: 24px;
      font-size: 7.2px;
    }

    .h3 th {
      height: 18px;
      font-size: 7px;
    }

    .sign-wrap {
      margin-top: 6px;
      width: 100%;
      border: 1px solid #000;
      border-bottom: none;
      border-right: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .sign-box {
      min-height: 66px;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 6px 7px 4px;
      font-size: 8px;
      line-height: 1.15;
    }

    .sign-title {
      font-weight: 700;
      margin-bottom: 8px;
    }

    .sign-line {
      margin-top: 4px;
    }

    .w1  { width: 6.5%; }
    .w2  { width: 10.5%; }
    .w3  { width: 10.5%; }
    .w4  { width: 10.5%; }
    .w5  { width: 7.8%; }
    .w6  { width: 7.8%; }
    .w7  { width: 7.8%; }
    .w8  { width: 9.2%; }
    .w9  { width: 7.8%; }
    .w10 { width: 11.5%; }
    .w11 { width: 15.1%; }
  </style>
</head>
<body>
  <div class="page">
    <div class="form-no">ফরম-০৪</div>

    <div class="title">সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি</div>
    <div class="subtitle">বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন</div>
    <div class="period">
      মাস:<span class="period-line">${escapeHtml(payload.monthBn)}</span>
      &nbsp;&nbsp;
      সাল:<span class="period-line">${escapeHtml(payload.yearBn)}</span>
    </div>

    <table class="info-table">
      <tr>
        <td>বিদ্যালয়ের নাম: ${escapeHtml(payload.schoolNameBn)}</td>
        <td>EMIS কোড: ${escapeHtml(payload.emisCode)}</td>
      </tr>
      <tr>
        <td>জেলা: ${escapeHtml(payload.district)}</td>
        <td>উপজেলা: ${escapeHtml(payload.upazila)}</td>
      </tr>
      <tr>
        <td>ইউনিয়ন: ${escapeHtml(payload.union)}</td>
        <td>ক্লাস্টার: ${escapeHtml(payload.cluster)}</td>
      </tr>
    </table>

    <table class="main-table">
      <colgroup>
        <col class="w1" />
        <col class="w2" />
        <col class="w3" />
        <col class="w4" />
        <col class="w5" />
        <col class="w6" />
        <col class="w7" />
        <col class="w8" />
        <col class="w9" />
        <col class="w10" />
        <col class="w11" />
      </colgroup>
      <thead>
        <tr class="h1">
          <th class="hlight" rowspan="2">ক্রমি<br/>ক<br/>নম্ব<br/>র</th>
          <th class="hlight" rowspan="2">খাদ্য<br/>গ্রহণের<br/>তারিখ</th>
          <th class="hchallan" rowspan="2">চালান<br/>নম্বর</th>
          <th class="hchallan" rowspan="2">চালানের<br/>তারিখ</th>
          <th class="hlight" colspan="5">গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)</th>
          <th class="hlight" rowspan="2">গ্রহণকারীর<br/>স্বাক্ষর</th>
          <th class="hlight" rowspan="2">মন্তব্য</th>
        </tr>
        <tr class="h2">
          <th class="hlight">বনরুটি</th>
          <th class="hlight">সিদ্ধ ডিম</th>
          <th class="hlight">কলা</th>
          <th class="hlight">ফর্টিফাইড<br/>বিস্কুট</th>
          <th class="hlight">ইউএইচটি<br/>দুধ</th>
        </tr>
        <tr class="h3 hgreen">
          <th>১</th>
          <th>২</th>
          <th>৩</th>
          <th>৪</th>
          <th>৫</th>
          <th>৬</th>
          <th>৭</th>
          <th>৮</th>
          <th>৯</th>
          <th>১০</th>
          <th>১১</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="htotal">
          <td colspan="4" class="l">মোট</td>
          <td>${escapeHtml(payload.totals.banruti)}</td>
          <td>${escapeHtml(payload.totals.egg)}</td>
          <td>${escapeHtml(payload.totals.banana)}</td>
          <td>${escapeHtml(payload.totals.biscuit)}</td>
          <td>${escapeHtml(payload.totals.milk)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="sign-wrap">
      <div class="sign-box">
        <div class="sign-title">টিফিন ম্যানেজারের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর: ${escapeHtml(payload.tifinManagerNumber)}</div>
      </div>

      <div class="sign-box">
        <div class="sign-title">প্রধান শিক্ষকের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর: ${escapeHtml(payload.headTeacherPhoneNumber)}</div>
      </div>

      <div class="sign-box">
        <div class="sign-title">সংশ্লিষ্ট ক্লাস্টারের উপজেলা সহকারী প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর:</div>
      </div>

      <div class="sign-box">
        <div class="sign-title">উপজেলা প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর:</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
// export async function buildSchoolDistributionMonthPdf(
//   payload: OfficialMonthlyReportPayload
// ): Promise<Buffer> {
//   const browser = await puppeteer.launch({
//     headless: true,
//     executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   try {
//     const page = await browser.newPage();
//     await page.setViewport({
//       width: 1240,
//       height: 1754,
//       deviceScaleFactor: 1,
//     });
//     await page.setContent(buildPdfHtml(payload), {
//       waitUntil: "networkidle0",
//     });
//     await page.evaluateHandle("document.fonts.ready");
//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       preferCSSPageSize: true,
//       margin: {
//         top: "0mm",
//         right: "0mm",
//         bottom: "0mm",
//         left: "0mm",
//       },
//     });
//     return Buffer.from(pdf);
//   } finally {
//     await browser.close();
//   }
// }
const REPORT_FONT_FAMILY = "Nirmala UI";
const cellBorder = {
    top: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
};
function pCell(text, opts = {}) {
    var _a;
    return new docx_1.Paragraph({
        alignment: (_a = opts.align) !== null && _a !== void 0 ? _a : docx_1.AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [
            new docx_1.TextRun({
                text: text || "",
                bold: opts.bold,
                size: opts.size ? opts.size * 2 : 18,
                font: REPORT_FONT_FAMILY,
            }),
        ],
    });
}
function docxCell(paragraphs, options = {}) {
    return new docx_1.TableCell({
        children: paragraphs,
        verticalAlign: docx_1.VerticalAlign.CENTER,
        borders: cellBorder,
        shading: options.shading
            ? { fill: options.shading.replace("#", ""), type: docx_1.ShadingType.CLEAR }
            : undefined,
        verticalMerge: options.verticalMerge,
        columnSpan: options.columnSpan,
    });
}
function buildSchoolDistributionMonthDocx(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const light = exports.FORM_COLORS.headerLight.replace("#", "");
        const challan = exports.FORM_COLORS.headerChallan.replace("#", "");
        const green = exports.FORM_COLORS.indexGreen.replace("#", "");
        const totalFill = exports.FORM_COLORS.totalRow.replace("#", "");
        const headerRow1 = new docx_1.TableRow({
            children: [
                docxCell([pCell("ক্রমি\nক\nনম্ব\nর", { bold: true, size: 9 })], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.RESTART,
                }),
                docxCell([pCell("খাদ্য\nগ্রহণের\nতারিখ", { bold: true, size: 9 })], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.RESTART,
                }),
                docxCell([pCell("চালান\nনম্বর", { bold: true, size: 9 })], {
                    shading: challan,
                    verticalMerge: docx_1.VerticalMergeType.RESTART,
                }),
                docxCell([pCell("চালানের\nতারিখ", { bold: true, size: 9 })], {
                    shading: challan,
                    verticalMerge: docx_1.VerticalMergeType.RESTART,
                }),
                docxCell([pCell("গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)", { bold: true, size: 10 })], {
                    shading: light,
                    columnSpan: 5,
                }),
                docxCell([pCell("গ্রহণকারীর\nস্বাক্ষর", { bold: true, size: 9 })], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.RESTART,
                }),
                docxCell([pCell("মন্তব্য", { bold: true, size: 9 })], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.RESTART,
                }),
            ],
        });
        const headerRow2 = new docx_1.TableRow({
            children: [
                docxCell([new docx_1.Paragraph("")], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.CONTINUE,
                }),
                docxCell([new docx_1.Paragraph("")], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.CONTINUE,
                }),
                docxCell([new docx_1.Paragraph("")], {
                    shading: challan,
                    verticalMerge: docx_1.VerticalMergeType.CONTINUE,
                }),
                docxCell([new docx_1.Paragraph("")], {
                    shading: challan,
                    verticalMerge: docx_1.VerticalMergeType.CONTINUE,
                }),
                docxCell([pCell("বনরুটি", { bold: true, size: 8 })], { shading: light }),
                docxCell([pCell("সিদ্ধ ডিম", { bold: true, size: 8 })], { shading: light }),
                docxCell([pCell("কলা", { bold: true, size: 8 })], { shading: light }),
                docxCell([pCell("ফর্টিফাইড\nবিস্কুট", { bold: true, size: 7 })], { shading: light }),
                docxCell([pCell("ইউএইচটি\nদুধ", { bold: true, size: 8 })], { shading: light }),
                docxCell([new docx_1.Paragraph("")], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.CONTINUE,
                }),
                docxCell([new docx_1.Paragraph("")], {
                    shading: light,
                    verticalMerge: docx_1.VerticalMergeType.CONTINUE,
                }),
            ],
        });
        const indexRow = new docx_1.TableRow({
            children: ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১"].map((n) => docxCell([pCell(n, { bold: true, size: 11 })], { shading: green })),
        });
        const dataRows = payload.table.map((row) => {
            const vals = [
                row.serialBn,
                row.receiptDate,
                row.challanNo,
                row.challanDate,
                row.banruti,
                row.egg,
                row.banana,
                row.biscuit,
                row.milk,
                row.signature,
                row.remark,
            ];
            return new docx_1.TableRow({
                children: vals.map((v, i) => docxCell([
                    pCell(v, {
                        size: 8,
                        align: i <= 1 ? docx_1.AlignmentType.LEFT : docx_1.AlignmentType.CENTER,
                    }),
                ], {})),
            });
        });
        const totalRow = new docx_1.TableRow({
            children: [
                docxCell([pCell("মোট", { bold: true, align: docx_1.AlignmentType.LEFT, size: 9 })], {
                    shading: totalFill,
                    columnSpan: 4,
                }),
                docxCell([pCell(payload.totals.banruti, { bold: true, size: 9 })], {
                    shading: totalFill,
                }),
                docxCell([pCell(payload.totals.egg, { bold: true, size: 9 })], {
                    shading: totalFill,
                }),
                docxCell([pCell(payload.totals.banana, { bold: true, size: 9 })], {
                    shading: totalFill,
                }),
                docxCell([pCell(payload.totals.biscuit, { bold: true, size: 9 })], {
                    shading: totalFill,
                }),
                docxCell([pCell(payload.totals.milk, { bold: true, size: 9 })], {
                    shading: totalFill,
                }),
                docxCell([pCell("", {})], { shading: totalFill }),
                docxCell([pCell("", {})], { shading: totalFill }),
            ],
        });
        const colTwip = [520, 850, 680, 680, 600, 600, 560, 660, 600, 720, 820];
        const mainTable = new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            columnWidths: colTwip,
            rows: [headerRow1, headerRow2, indexRow, ...dataRows, totalRow],
        });
        const sigLines = (lines) => lines.map((ln) => new docx_1.Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
                new docx_1.TextRun({
                    text: ln,
                    bold: true,
                    font: REPORT_FONT_FAMILY,
                    size: 20,
                }),
            ],
        }));
        const sigTable = new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            columnWidths: [4680, 4680],
            rows: [
                new docx_1.TableRow({
                    children: [
                        docxCell(sigLines([
                            "টিফিন ম্যানেজারের স্বাক্ষর ও সিল:",
                            "তারিখ:",
                            `মোবাইল নম্বর: ${payload.tifinManagerNumber}`,
                        ])),
                        docxCell(sigLines([
                            "প্রধান শিক্ষকের স্বাক্ষর ও সিল:",
                            "তারিখ:",
                            `মোবাইল নম্বর: ${payload.headTeacherPhoneNumber}`,
                        ])),
                    ],
                }),
                new docx_1.TableRow({
                    children: [
                        docxCell(sigLines([
                            "সংশ্লিষ্ট ক্লাস্টারের উপজেলা সহকারী প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:",
                            "তারিখ:",
                            "মোবাইল নম্বর:",
                        ])),
                        docxCell(sigLines([
                            "উপজেলা প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:",
                            "তারিখ:",
                            "মোবাইল নম্বর:",
                        ])),
                    ],
                }),
            ],
        });
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: {
                        page: {
                            margin: { top: 720, right: 720, bottom: 720, left: 720 },
                        },
                    },
                    children: [
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            spacing: { after: 260 },
                            children: [
                                new docx_1.TextRun({
                                    text: "ফরম-০৪",
                                    bold: true,
                                    size: 24,
                                    font: REPORT_FONT_FAMILY,
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 40 },
                            children: [
                                new docx_1.TextRun({
                                    text: "সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি",
                                    bold: true,
                                    size: 28,
                                    font: REPORT_FONT_FAMILY,
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 50 },
                            children: [
                                new docx_1.TextRun({
                                    text: "বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন",
                                    bold: true,
                                    size: 24,
                                    font: REPORT_FONT_FAMILY,
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 140 },
                            children: [
                                new docx_1.TextRun({
                                    text: `মাস: ${payload.monthBn}     সাল: ${payload.yearBn}`,
                                    bold: true,
                                    size: 22,
                                    font: REPORT_FONT_FAMILY,
                                }),
                            ],
                        }),
                        new docx_1.Table({
                            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                            columnWidths: [5040, 4320],
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        docxCell([
                                            new docx_1.Paragraph({
                                                children: [
                                                    new docx_1.TextRun({
                                                        text: "বিদ্যালয়ের নাম: ",
                                                        bold: true,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                    new docx_1.TextRun({
                                                        text: payload.schoolNameBn,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                ],
                                            }),
                                        ]),
                                        docxCell([
                                            new docx_1.Paragraph({
                                                children: [
                                                    new docx_1.TextRun({
                                                        text: "EMIS কোড: ",
                                                        bold: true,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                    new docx_1.TextRun({
                                                        text: payload.emisCode,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                ],
                                            }),
                                        ]),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        docxCell([
                                            new docx_1.Paragraph({
                                                children: [
                                                    new docx_1.TextRun({
                                                        text: "জেলা: ",
                                                        bold: true,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                    new docx_1.TextRun({
                                                        text: payload.district,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                ],
                                            }),
                                        ]),
                                        docxCell([
                                            new docx_1.Paragraph({
                                                children: [
                                                    new docx_1.TextRun({
                                                        text: "উপজেলা: ",
                                                        bold: true,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                    new docx_1.TextRun({
                                                        text: payload.upazila,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                ],
                                            }),
                                        ]),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        docxCell([
                                            new docx_1.Paragraph({
                                                children: [
                                                    new docx_1.TextRun({
                                                        text: "ইউনিয়ন: ",
                                                        bold: true,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                    new docx_1.TextRun({
                                                        text: payload.union,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                ],
                                            }),
                                        ]),
                                        docxCell([
                                            new docx_1.Paragraph({
                                                children: [
                                                    new docx_1.TextRun({
                                                        text: "ক্লাস্টার: ",
                                                        bold: true,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                    new docx_1.TextRun({
                                                        text: payload.cluster,
                                                        font: REPORT_FONT_FAMILY,
                                                    }),
                                                ],
                                            }),
                                        ]),
                                    ],
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({ spacing: { after: 200 } }),
                        mainTable,
                        new docx_1.Paragraph({ spacing: { after: 240 } }),
                        sigTable,
                    ],
                },
            ],
        });
        return Buffer.from(yield docx_1.Packer.toBuffer(doc));
    });
}
const exportSchoolDistributionMonthlyReport = (payload, format, period) => __awaiter(void 0, void 0, void 0, function* () {
    const safeCode = banglaToEnglishDigits(payload.emisCode).replace(/[^a-zA-Z0-9-_]/g, "_");
    const ym = `${period.year}-${String(period.month).padStart(2, "0")}`;
    const base = `monthly-food-report-${safeCode}-${ym}`;
    // if (format === "pdf") {
    //   const buffer = await buildSchoolDistributionMonthPdf(payload);
    //   return {
    //     buffer,
    //     contentType: "application/pdf",
    //     filename: `${base}.pdf`,
    //   };
    // }
    const buffer = yield buildSchoolDistributionMonthDocx(payload);
    return {
        buffer,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename: `${base}.docx`,
    };
});
exports.exportSchoolDistributionMonthlyReport = exportSchoolDistributionMonthlyReport;
