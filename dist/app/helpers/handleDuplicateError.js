"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const handleDuplicateError = (err) => {
    const keyValue = (err === null || err === void 0 ? void 0 : err.keyValue) || {};
    const path = Object.keys(keyValue)[0] || "";
    const value = Object.values(keyValue)[0] || "";
    const errorSources = [
        {
            path,
            message: value ? `${value} already exists` : "Duplicate value already exists",
        },
    ];
    return {
        statusCode: http_status_codes_1.StatusCodes.CONFLICT,
        message: "Duplicate Field Error",
        errorSources,
    };
};
exports.handleDuplicateError = handleDuplicateError;
