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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveChallanBlock = reserveChallanBlock;
exports.formatChallanNo = formatChallanNo;
exports.getCurrentChallanSeq = getCurrentChallanSeq;
const counter_model_1 = require("../modules/challan/counter.model");
/**
 * একটা block reserve করো — DB কে মাত্র একবার hit করে
 * 5000 নম্বর লাগলেও একটাই $inc call
 */
function reserveChallanBlock(count) {
    return __awaiter(this, void 0, void 0, function* () {
        if (count <= 0)
            throw new Error("count must be > 0");
        const counter = yield counter_model_1.Counter.findByIdAndUpdate("challanNo", { $inc: { seq: count } }, { new: true, upsert: true });
        // counter.seq = শেষ নম্বর
        // শুরুর নম্বর = শেষ - count + 1
        return counter.seq - count + 1;
    });
}
/**
 * Number কে 6 digit padded string এ convert করো
 * 1    → "000001"
 * 999  → "000999"
 * 4992 → "004992"
 */
function formatChallanNo(num) {
    if (num > 999999)
        throw new Error(`Challan number ${num} exceeds 6 digits`);
    return num.toString().padStart(6, "0");
}
/**
 * Current counter দেখো — read only, কিছু বদলায় না
 */
function getCurrentChallanSeq() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const counter = yield counter_model_1.Counter.findById("challanNo");
        return (_a = counter === null || counter === void 0 ? void 0 : counter.seq) !== null && _a !== void 0 ? _a : 0;
    });
}
