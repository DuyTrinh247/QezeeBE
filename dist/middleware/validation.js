"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Validation error",
                    details: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            console.log('Validating params:', req.params);
            const validatedParams = schema.parse(req.params);
            req.params = validatedParams;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                console.log('Validation error:', error.issues);
                return res.status(400).json({
                    error: "Validation error",
                    details: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validatedQuery = schema.parse(req.query);
            req.query = validatedQuery;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Validation error",
                    details: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
}
