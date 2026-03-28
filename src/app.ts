import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();
app.use(express.json());

// ✅ allowed origins (clean)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8081",

  "https://lovable.dev",
  "https://admin-dashboard-gamma-inky-62.vercel.app",
  "https://school-snack-stats.lovable.app",
  "https://sfp.osacabd.org",
];

// ✅ dynamic CORS handler (no issues)
app.use(
  cors({
    origin: (origin, callback) => {
      // 🔥 allow requests with no origin (mobile apps, postman)
      if (!origin) return callback(null, true);

      // 🔥 allow localhost সব port
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // 🔥 allow local network (192.168...)
      if (origin.startsWith("http://192.168")) {
        return callback(null, true);
      }

      // 🔥 allow from list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ❌ block others
      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

// ✅ preflight fix (important)
app.options("*", cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to osaca Careers",
  });
});

// error handler
app.use(globalErrorHandler);
app.use(notFound);

export default app;