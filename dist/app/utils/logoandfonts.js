"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogoBase64 = getLogoBase64;
exports.getBengaliFontBase64 = getBengaliFontBase64;
const path_1 = __importDefault(require("path"));
const fs_1 = __importStar(require("fs"));
function getLogoBase64() {
    const logoPath = path_1.default.join(process.cwd(), "src/assets/osaca-logo.webp");
    if (fs_1.default.existsSync(logoPath)) {
        const logo = fs_1.default.readFileSync(logoPath);
        return `data:image/webp;base64,${logo.toString("base64")}`;
    }
    return "";
}
let cachedFont = null;
function getBengaliFontBase64() {
    if (cachedFont)
        return cachedFont; // প্রতিবার disk read না করে cache
    const fontPath = path_1.default.join(process.cwd(), "src/assets/NotoSerifBengali.ttf");
    cachedFont = (0, fs_1.readFileSync)(fontPath).toString("base64");
    return cachedFont;
}
