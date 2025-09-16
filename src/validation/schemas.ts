import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(100, "Username too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, "Google token is required"),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

export const userIdSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

// Quiz schemas
export const createQuizSchema = z.object({
  pdf_file_id: z.string().min(1, "PDF file ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  time_limit: z.number().int().min(0, "Time limit must be non-negative").optional(),
  quiz_data: z.any().optional(), // JSONB data
  total_questions: z.number().int().min(0, "Total questions must be non-negative").optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().optional(),
  time_limit: z.number().int().min(0, "Time limit must be non-negative").optional(),
  quiz_data: z.any().optional(), // JSONB data
  total_questions: z.number().int().min(0, "Total questions must be non-negative").optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const quizIdSchema = z.object({
  id: z.string().uuid("Invalid quiz ID format"),
});

export const attemptIdSchema = z.object({
  attemptId: z.string().uuid("Invalid attempt ID format"),
});

export const quizHashcodeSchema = z.object({
  hashcode: z.string().min(1, "Hashcode là bắt buộc"),
});

export const dateRangeSchema = z.object({
  startDate: z.string().min(1, "Start date là bắt buộc"),
  endDate: z.string().min(1, "End date là bắt buộc"),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Từ khóa tìm kiếm là bắt buộc"),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizIdParams = z.infer<typeof quizIdSchema>;
export type QuizHashcodeParams = z.infer<typeof quizHashcodeSchema>;
export type DateRangeQuery = z.infer<typeof dateRangeSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;

