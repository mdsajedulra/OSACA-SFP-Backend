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
const puppeteer_1 = __importDefault(require("puppeteer"));
const htmlToPdf = (html, pdfOptions) => __awaiter(void 0, void 0, void 0, function* () {
    let browser;
    try {
        browser = yield puppeteer_1.default.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: "domcontentloaded", timeout: 0, });
        yield page.evaluateHandle("document.fonts.ready");
        const pdf = yield page.pdf(Object.assign({ format: "A4", printBackground: true, margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }, timeout: 0 }, pdfOptions));
        yield page.close();
        return Buffer.from(pdf);
    }
    finally {
        if (browser)
            yield browser.close();
    }
});
exports.default = htmlToPdf;
