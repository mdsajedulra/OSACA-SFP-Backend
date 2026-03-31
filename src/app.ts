import express, { Application, Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions: CorsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | origin: ${
      req.headers.origin || "no-origin"
    }`
  );
  next();
});

app.use(cors(corsOptions));

// ✅ Express 5 safe preflight handler
app.options(/.*/, cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to osaca Careers",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    time: new Date().toISOString(),
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);

export default app;