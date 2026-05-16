import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
    return;
  }

  if ((error as { code?: number })?.code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate field value"
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};
