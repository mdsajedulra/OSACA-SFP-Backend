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
app.use(express_1.default.json());
// ✅ allowed origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
    "https://lovable.dev",
    "https://admin-dashboard-gamma-inky-62.vercel.app",
    "https://school-snack-stats.lovable.app",
    "https://sfp.osacabd.org",
];
// ✅ CORS setup (safe + flexible)
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow mobile app / postman
        if (!origin)
            return callback(null, true);
        // allow localhost সব port
        if (origin.startsWith("http://localhost")) {
            return callback(null, true);
        }
        // allow local network
        if (origin.startsWith("http://192.168")) {
            return callback(null, true);
        }
        // allow specific domains
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // block others
        return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
}));
// ❌ REMOVE this line (this was causing error)
// app.options("*", cors());
// ✅ routes
app.use("/api/v1", routes_1.default);
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to osaca Careers",
    });
});
// ✅ error handlers
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
