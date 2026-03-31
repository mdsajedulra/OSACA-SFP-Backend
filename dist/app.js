"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
};
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | origin: ${req.headers.origin || "no-origin"}`);
    next();
});
app.use((0, cors_1.default)(corsOptions));
// ✅ Express 5 safe preflight handler
app.options(/.*/, (0, cors_1.default)(corsOptions));
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to osaca Careers",
    });
});
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        time: new Date().toISOString(),
    });
});
app.use("/api/v1", routes_1.default);
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
