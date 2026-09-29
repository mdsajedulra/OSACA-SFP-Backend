"use strict";
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
    // ১. Env variable সবচেয়ে priority পাবে (VPS-এ এটা set করবে)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    // ২. Puppeteer-এর নিজের install করা browser খোঁজো (Mac/Windows/Linux সব জায়গায় কাজ করে)
    try {
        const path = (_a = (0, child_process_1.execSync)("npx puppeteer browsers list chrome-headless-shell", { encoding: "utf-8" })
            .split("\n")
            .find((line) => line.includes("chrome-headless-shell"))) === null || _a === void 0 ? void 0 : _a.split(" ").pop();
        if (path && (0, fs_1.existsSync)(path))
            return path;
    }
    catch (_b) {
        // ignore, fallback-এ যাও
    }
    // ৩. System Chrome fallback (platform অনুযায়ী)
    const candidates = process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : process.platform === "linux"
            ? ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"]
            : ["C:/Program Files/Google/Chrome/Application/chrome.exe"];
    const found = candidates.find((p) => (0, fs_1.existsSync)(p));
    if (found)
        return found;
    throw new Error("Chrome not found. Run: npx puppeteer browsers install chrome-headless-shell");
};
// Path একবারই resolve হবে, প্রতি request-এ না
const CHROME_PATH = resolveChromePath();
const launchBrowser = () => puppeteer_core_1.default.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
    ],
});
exports.launchBrowser = launchBrowser;
