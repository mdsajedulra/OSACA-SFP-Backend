"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
const toBanglaNumber_1 = require("./toBanglaNumber");
function formatDate(date) {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString();
    return `${(0, toBanglaNumber_1.toBanglaNumber)(+d)}/${(0, toBanglaNumber_1.toBanglaNumber)(+m)}/${(0, toBanglaNumber_1.toBanglaNumber)(+y)}`;
}
