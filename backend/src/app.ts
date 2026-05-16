import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import leadRoutes from "./routes/leadRoutes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Smart Leads API is running" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
