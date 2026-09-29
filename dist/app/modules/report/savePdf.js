"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// utils/savePdf.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const savePdf = (pdf, reportName) => {
    const REPORTS_DIR = path_1.default.join(process.cwd(), "exports", `${reportName}`);
    if (!fs_1.default.existsSync(REPORTS_DIR)) {
        fs_1.default.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    const fileName = `${reportName}-${Date.now()}.pdf`;
    const filePath = path_1.default.join(REPORTS_DIR, fileName);
    fs_1.default.writeFileSync(filePath, pdf);
    return filePath;
};
exports.default = savePdf;
