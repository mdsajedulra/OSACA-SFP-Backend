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
exports.launchBrowser = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const resolveChromePath = () => {
    var _a;
    // 1. Environment variable
    if (process.env.PUPPETEER_EXECUTABLE_PATH &&
        (0, fs_1.existsSync)(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    // 2. Puppeteer browser
    try {
        const path = (_a = (0, child_process_1.execSync)("npx puppeteer browsers list chrome-headless-shell", { encoding: "utf-8" })
            .split("\n")
            .find((line) => line.includes("chrome-headless-shell"))) === null || _a === void 0 ? void 0 : _a.split(" ").pop();
        if (path && (0, fs_1.existsSync)(path)) {
            return path;
        }
    }
    catch (_b) {
        // Puppeteer/Chrome not available
    }
    // 3. System Chrome
    const candidates = process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : process.platform === "linux"
            ? [
                "/usr/bin/google-chrome-stable",
                "/usr/bin/google-chrome",
                "/usr/bin/chromium-browser",
                "/usr/bin/chromium",
            ]
            : ["C:/Program Files/Google/Chrome/Application/chrome.exe"];
    const found = candidates.find((p) => (0, fs_1.existsSync)(p));
    if (found) {
        return found;
    }
    // Chrome না থাকলেও server crash করবে না
    console.warn("⚠️ Chrome not found. Puppeteer features are disabled.");
    return null;
};
const CHROME_PATH = resolveChromePath();
const launchBrowser = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!CHROME_PATH) {
        throw new Error("PDF/browser feature is not available on this server because Chrome is not installed.");
    }
    return puppeteer_core_1.default.launch({
        headless: true,
        executablePath: CHROME_PATH,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    });
});
exports.launchBrowser = launchBrowser;
