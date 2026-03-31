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
// trust proxy (hosting / reverse proxy থাকলে helpful)
app.set("trust proxy", 1);
// body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// stable cors config
const corsOptions = {
    origin: true, // request origin automatically allow
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
};
// request log
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | origin: ${req.headers.origin || "no-origin"}`);
    next();
});
// cors must come before routes
app.use((0, cors_1.default)(corsOptions));
// preflight handle
app.options(/.*/, (0, cors_1.default)(corsOptions));
// health check
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
// api routes
app.use("/api/v1", routes_1.default);
// error handlers
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
