import express, { Application, Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();

// trust proxy (hosting / reverse proxy থাকলে helpful)
app.set("trust proxy", 1);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// stable cors config
const corsOptions: CorsOptions = {
  origin: true, // request origin automatically allow
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// request log
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | origin: ${
      req.headers.origin || "no-origin"
    }`
  );
  next();
});

// cors must come before routes
app.use(cors(corsOptions));

// preflight handle
app.options(/.*/, cors(corsOptions));

// health check
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

// api routes
app.use("/api/v1", router);

// error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;