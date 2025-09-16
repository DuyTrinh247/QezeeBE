"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSchema = exports.dateRangeSchema = exports.quizHashcodeSchema = exports.attemptIdSchema = exports.quizIdSchema = exports.updateQuizSchema = exports.createQuizSchema = exports.userIdSchema = exports.updateUserSchema = exports.createUserSchema = exports.googleLoginSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required").max(100, "Username too long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name too long"),
    email: zod_1.z.string().email("Invalid email format").max(255, "Email too long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});
exports.googleLoginSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Google token is required"),
});
// User schemas
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name too long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name too long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});
exports.userIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid user ID format"),
});
// Quiz schemas
exports.createQuizSchema = zod_1.z.object({
    pdf_file_id: zod_1.z.string().min(1, "PDF file ID is required"),
    title: zod_1.z.string().min(1, "Title is required").max(200, "Title too long"),
    description: zod_1.z.string().optional(),
    time_limit: zod_1.z.number().int().min(0, "Time limit must be non-negative").optional(),
    quiz_data: zod_1.z.any().optional(), // JSONB data
    total_questions: zod_1.z.number().int().min(0, "Total questions must be non-negative").optional(),
    difficulty_level: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'archived']).optional(),
});
exports.updateQuizSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(200, "Title too long").optional(),
    description: zod_1.z.string().optional(),
    time_limit: zod_1.z.number().int().min(0, "Time limit must be non-negative").optional(),
    quiz_data: zod_1.z.any().optional(), // JSONB data
    total_questions: zod_1.z.number().int().min(0, "Total questions must be non-negative").optional(),
    difficulty_level: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'archived']).optional(),
});
exports.quizIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid quiz ID format"),
});
exports.attemptIdSchema = zod_1.z.object({
    attemptId: zod_1.z.string().uuid("Invalid attempt ID format"),
});
exports.quizHashcodeSchema = zod_1.z.object({
    hashcode: zod_1.z.string().min(1, "Hashcode là bắt buộc"),
});
exports.dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().min(1, "Start date là bắt buộc"),
    endDate: zod_1.z.string().min(1, "End date là bắt buộc"),
});
exports.searchSchema = zod_1.z.object({
    q: zod_1.z.string().min(1, "Từ khóa tìm kiếm là bắt buộc"),
});
