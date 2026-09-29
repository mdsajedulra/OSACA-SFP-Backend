"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBdMonthRange = void 0;
const getBdMonthRange = (year, month) => {
    const start = new Date(Date.UTC(year, month - 1, 1, -6, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, -6, 0, 0, 0) - 1);
    return { start, end };
};
exports.getBdMonthRange = getBdMonthRange;
