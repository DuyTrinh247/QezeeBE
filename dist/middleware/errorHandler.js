"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(error, req, res, next) {
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
function notFoundHandler(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
}
