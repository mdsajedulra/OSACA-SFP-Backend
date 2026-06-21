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
exports.generateAllChallansPdf = generateAllChallansPdf;
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdf_lib_1 = require("pdf-lib");
const distribution_model_1 = require("../foodDistributions/distribution.model");
const formatDate_1 = require("../../utils/formatDate");
const challanHTML_1 = require("../../utils/challanHTML");
const archiver_1 = require("archiver");
const CHROME_PATH = "C:/Users/mdsaj/.cache/puppeteer/chrome-headless-shell/win64-149.0.7827.22/chrome-headless-shell-win64/chrome-headless-shell.exe";
function getLogoBase64() {
    const logoPath = path_1.default.join(process.cwd(), "src/assets/osaca-logo.webp");
    if (fs_1.default.existsSync(logoPath)) {
        const logo = fs_1.default.readFileSync(logoPath);
        return `data:image/webp;base64,${logo.toString("base64")}`;
    }
    return "";
}
function toLocalDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function buildFullHTML(challans, logoBase64) {
    const pages = challans
        .map((c) => `
  <div class="page">
    <div class="guide-x"></div>
    <div class="guide-y"></div>
    ${(0, challanHTML_1.challanHTML)(c, logoBase64)}
    ${(0, challanHTML_1.challanHTML)(c, logoBase64)}
    ${(0, challanHTML_1.challanHTML)(c, logoBase64)}
    ${(0, challanHTML_1.challanHTML)(c, logoBase64)}
  </div>`)
        .join("");
    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Serif Bengali',serif; background:#fff; }

  .page {
    width: 10in;
    height: 15in;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 4px;
    padding: 6px;
    position: relative;
   
    page-break-after: always;
    overflow: hidden;
  }

  .guide-x {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    border-top: 1px dashed red;
    pointer-events: none;
    z-index: 10;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  .guide-y {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    border-left: 1px dashed blue;
    pointer-events: none;
    z-index: 10;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  .challan{ width:90%; height:100%; margin-left:0.3in; background:#fff; font-size:12px; overflow:hidden;  border: 0.5px }
  table{ width:100%; border-collapse:collapse; }
  td,th{ border:0.5px solid #000; padding:2px 3px; vertical-align:top; font-size:12px; }
  th{ color:#000; text-align:center; font-weight:700; font-size:12px; }
  .top-td{ border:none; padding:3px 4px; vertical-align:bottom; }
  .serial{ font-size:12px; font-weight:700; }
  .challan-no{ font-size:12px; font-weight:700; margin-top:1px; }
  .logo-name{ font-size:12px; font-weight:900; color:#c00; letter-spacing:1px; line-height:1; }
  .logo-sub{ font-size:12px; color:#333; line-height:1; }
  .form-badge{ font-size:12px; border:0.5px solid #000; padding:1px 5px; display:inline-block; margin-bottom:2px; }
  .title-bar{ background:#BFBFBF; border-left:0.5px solid #000; border-right:0.5px solid #000; border-top:0.5px solid #000; color:#000; text-align:center; font-size:12px; font-weight:700; padding:3px 0; }
  .bg-gray{ background:#BFBFBF; }
  .sec-head{ font-weight:700; font-size:12px; display:block; }
  .fl{ display:inline-block; min-width:65px; font-size:12px;  }
  .f2{ display:inline-block; min-width:60px; font-size:12px; }
  .fv{ font-size:12px; }
  .frow{ display:flex; line-height:1.2; margin-bottom:1px; }
  .bank-label{ font-size:12px; font-weight:600; }
  .bank-no{ font-size:12px; font-weight:700; margin-top:2px; }
  .sign-title{ font-weight:700; font-size:12px; #000; padding-bottom:2px; margin-bottom:36px; margin-top:5px; }
  .sign-line{ font-size:12px; line-height:1; }
  .note-td{ font-size:12px; line-height:1; width:50%; }
</style>
</head>
<body>
  ${pages}
</body>
</html>`;
}
function generatePdfBuffer(challans, browser, logoBase64) {
    return __awaiter(this, void 0, void 0, function* () {
        const CHUNK_SIZE = 50;
        const chunks = [];
        for (let i = 0; i < challans.length; i += CHUNK_SIZE) {
            chunks.push(challans.slice(i, i + CHUNK_SIZE));
        }
        const chunkPdfs = [];
        for (const chunk of chunks) {
            const page = yield browser.newPage();
            yield page.setContent(buildFullHTML(chunk, logoBase64), {
                waitUntil: "domcontentloaded",
            });
            yield new Promise((r) => setTimeout(r, 1500));
            const pdfBuffer = yield page.pdf({
                width: "10in",
                height: "15in",
                printBackground: true,
                margin: { top: "0", right: "0", bottom: "0", left: "0" },
            });
            chunkPdfs.push(Buffer.from(pdfBuffer));
            yield page.close();
        }
        const mergedPdf = yield pdf_lib_1.PDFDocument.create();
        for (const buf of chunkPdfs) {
            const pdf = yield pdf_lib_1.PDFDocument.load(buf);
            const pages = yield mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach((p) => mergedPdf.addPage(p));
        }
        const bytes = yield mergedPdf.save();
        return Buffer.from(bytes);
    });
}
function generateAllChallansPdf(batchId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const logoBase64 = getLogoBase64();
        const distributions = yield distribution_model_1.FoodDistribution.find({ batchId })
            .populate({
            path: "schoolId",
            populate: {
                path: "address.upazilaId",
                model: "Upazila",
            },
        })
            .sort({ date: 1 })
            .lean();
        const upazilaMap = new Map();
        for (const dist of distributions) {
            const school = dist.schoolId;
            const upazila = (_a = school === null || school === void 0 ? void 0 : school.address) === null || _a === void 0 ? void 0 : _a.upazilaId;
            const upazilaName = (_b = upazila === null || upazila === void 0 ? void 0 : upazila.upazilaName) !== null && _b !== void 0 ? _b : "অজানা-উপজেলা";
            const dateStr = toLocalDateStr(new Date(dist.date));
            if (!upazilaMap.has(upazilaName)) {
                upazilaMap.set(upazilaName, new Map());
            }
            const dateMap = upazilaMap.get(upazilaName);
            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, []);
            }
            for (const item of dist.items) {
                dateMap.get(dateStr).push({
                    challanNo: String(item.challanNo),
                    date: (0, formatDate_1.formatDate)(new Date(dist.date)),
                    schoolName: (_c = school === null || school === void 0 ? void 0 : school.schoolNameBangla) !== null && _c !== void 0 ? _c : "",
                    schoolCode: (_d = school === null || school === void 0 ? void 0 : school.schoolCode) !== null && _d !== void 0 ? _d : "",
                    union: (_f = (_e = school === null || school === void 0 ? void 0 : school.address) === null || _e === void 0 ? void 0 : _e.union) !== null && _f !== void 0 ? _f : "",
                    upazila: upazilaName,
                    district: (_h = (_g = school === null || school === void 0 ? void 0 : school.address) === null || _g === void 0 ? void 0 : _g.district) !== null && _h !== void 0 ? _h : "",
                    foodName: item.food,
                    quantity: item.sent,
                    pdOfficeSerial: (_j = school === null || school === void 0 ? void 0 : school.pdOfficeSerial) !== null && _j !== void 0 ? _j : 0,
                    concernedOfficerName: (_k = upazila === null || upazila === void 0 ? void 0 : upazila.concernedOfficerName) !== null && _k !== void 0 ? _k : "",
                    concernedOfficerNumber: (_l = upazila === null || upazila === void 0 ? void 0 : upazila.concernedOfficerNumber) !== null && _l !== void 0 ? _l : "",
                    concernedOfficerDesignation: (_m = upazila === null || upazila === void 0 ? void 0 : upazila.concernedOfficerDesignation) !== null && _m !== void 0 ? _m : "",
                });
            }
        }
        const outputDir = path_1.default.join(process.cwd(), "exports", batchId);
        if (!fs_1.default.existsSync(outputDir))
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        const tmpDir = path_1.default.join(process.cwd(), `chrome-tmp-${Date.now()}`);
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            // executablePath: CHROME_PATH,
            args: [
                "--no-sandbox",
                // "--disable-setuid-sandbox",
                // "--disable-dev-shm-usage",
                // "--disable-extensions",
                // "--no-first-run",
            ],
            // userDataDir: tmpDir,
        });
        try {
            for (const [upazilaName, dateMap] of upazilaMap) {
                console.log(`📁 উপজেলা: ${upazilaName}`);
                const upazilaDir = path_1.default.join(outputDir, upazilaName);
                if (!fs_1.default.existsSync(upazilaDir)) {
                    fs_1.default.mkdirSync(upazilaDir, { recursive: true });
                }
                for (const [dateStr, challans] of dateMap) {
                    console.log(`  📅 ${dateStr} — ${challans.length} চালান`);
                    challans.sort((a, b) => { var _a, _b; return Number((_a = a.pdOfficeSerial) !== null && _a !== void 0 ? _a : 0) - Number((_b = b.pdOfficeSerial) !== null && _b !== void 0 ? _b : 0); });
                    const pdfBuffer = yield generatePdfBuffer(challans, browser, logoBase64);
                    const pdfPath = path_1.default.join(upazilaDir, `${upazilaName + " " + dateStr}.pdf`);
                    fs_1.default.writeFileSync(pdfPath, pdfBuffer);
                }
            }
        }
        finally {
            yield browser.close();
            setTimeout(() => {
                try {
                    fs_1.default.rmSync(tmpDir, { recursive: true, force: true });
                }
                catch (e) { }
            }, 3000);
        }
        console.log("🗜️ ZIP বানানো হচ্ছে...");
        const zipPath = path_1.default.join(process.cwd(), "exports", `challans-${batchId}.zip`);
        yield new Promise((resolve, reject) => {
            const output = fs_1.default.createWriteStream(zipPath);
            const archive = new archiver_1.ZipArchive({
                zlib: { level: 9 }, // Sets the compression level.
            });
            output.on("close", resolve);
            archive.on("error", reject);
            archive.pipe(output);
            archive.directory(outputDir, false);
            archive.finalize();
        });
        fs_1.default.rmSync(outputDir, { recursive: true, force: true });
        console.log(`✅ ZIP ready: ${zipPath}`);
        return zipPath;
    });
}
