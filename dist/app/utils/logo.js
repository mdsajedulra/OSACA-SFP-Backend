"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogoBase64 = getLogoBase64;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getLogoBase64() {
    const logoPath = path_1.default.join(process.cwd(), "src/assets/osaca-logo.webp");
    if (fs_1.default.existsSync(logoPath)) {
        const logo = fs_1.default.readFileSync(logoPath);
        return `data:image/webp;base64,${logo.toString("base64")}`;
    }
    return "";
}
