import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();

// ✅ body parser
app.use(express.json());

// ✅ SIMPLE CORS (no headache)
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true,
  })
);

// ✅ handle preflight requests
app.options("*", cors());

// ✅ routes
app.use("/api/v1", router);

// ✅ test route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to osaca Careers",
  });
});

// ✅ error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;