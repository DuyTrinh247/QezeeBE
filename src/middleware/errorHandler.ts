import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`, {
    url: req.url,
    method: req.method,
    body: req.body,
    stack: error.stack
  });

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error: AppError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
}

