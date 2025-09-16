"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizzes = getQuizzes;
exports.getQuiz = getQuiz;
exports.getQuizByHash = getQuizByHash;
exports.createQuiz = createQuiz;
exports.updateQuiz = updateQuiz;
exports.deleteQuiz = deleteQuiz;
exports.getQuizzesByDateRange = getQuizzesByDateRange;
exports.searchQuizzes = searchQuizzes;
const quizzesService_1 = require("../services/quizzesService");
const schemas_1 = require("../validation/schemas");
async function getQuizzes(_req, res) {
    try {
        const quizzes = await (0, quizzesService_1.listQuizzes)();
        res.status(200).json({ quizzes });
    }
    catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách quizzes" });
    }
}
async function getQuiz(req, res) {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "ID không hợp lệ" });
        const quiz = await (0, quizzesService_1.findQuizById)(id);
        if (!quiz)
            return res.status(404).json({ error: "Không tìm thấy quiz" });
        res.status(200).json({ quiz });
    }
    catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy quiz" });
    }
}
async function getQuizByHash(req, res) {
    try {
        const hashcode = req.params.hashcode;
        if (!hashcode)
            return res.status(400).json({ error: "Hashcode không hợp lệ" });
        const quiz = await (0, quizzesService_1.findQuizByPdfFileId)(hashcode); // TODO: Update logic for hashcode search
        if (!quiz)
            return res.status(404).json({ error: "Không tìm thấy quiz với hashcode này" });
        res.status(200).json({ quiz });
    }
    catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy quiz theo hashcode" });
    }
}
async function createQuiz(req, res) {
    var _a;
    try {
        // Validate request body
        const validationResult = schemas_1.createQuizSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation error",
                details: validationResult.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        const validatedData = validationResult.data;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const quiz = await (0, quizzesService_1.addQuiz)({
            ...validatedData,
            time_limit: validatedData.time_limit, // Use time_limit directly
            quiz_data: validatedData.quiz_data || {}
        });
        res.status(201).json({ quiz });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Error creating quiz" });
        }
    }
}
async function updateQuiz(req, res) {
    var _a;
    try {
        const id = req.params.id;
        const { ngay_tao, json, thoi_gian, hashcode } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
        if (!id)
            return res.status(400).json({ error: "ID không hợp lệ" });
        // Validation cho các trường được cập nhật
        if (ngay_tao !== undefined && typeof ngay_tao !== "string") {
            return res.status(400).json({ error: "ngay_tao phải là string" });
        }
        if (json !== undefined && typeof json !== "object") {
            return res.status(400).json({ error: "json phải là object" });
        }
        if (thoi_gian !== undefined && typeof thoi_gian !== "string") {
            return res.status(400).json({ error: "thoi_gian phải là string" });
        }
        if (hashcode !== undefined && typeof hashcode !== "string") {
            return res.status(400).json({ error: "hashcode phải là string" });
        }
        const quiz = await (0, quizzesService_1.editQuiz)(id, {
            title: "Updated Quiz", // TODO: Get from request
            quiz_data: json
        });
        if (!quiz)
            return res.status(404).json({ error: "Không tìm thấy quiz" });
        res.status(200).json({ quiz });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Lỗi khi cập nhật quiz" });
        }
    }
}
async function deleteQuiz(req, res) {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "ID không hợp lệ" });
        const ok = await (0, quizzesService_1.removeQuiz)(id);
        if (!ok)
            return res.status(404).json({ error: "Không tìm thấy quiz" });
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Lỗi khi xóa quiz" });
        }
    }
}
async function getQuizzesByDateRange(req, res) {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "startDate và endDate là bắt buộc" });
        }
        if (typeof startDate !== "string" || typeof endDate !== "string") {
            return res.status(400).json({ error: "startDate và endDate phải là string" });
        }
        const quizzes = await (0, quizzesService_1.getQuizzesByUserId)("temp-user-id"); // TODO: Update logic for date range search
        res.status(200).json({ quizzes });
    }
    catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy quizzes theo khoảng thời gian" });
    }
}
async function searchQuizzes(req, res) {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({ error: "Tham số tìm kiếm 'q' là bắt buộc" });
        }
        const quizzes = await (0, quizzesService_1.searchQuizzesByContent)(q);
        res.status(200).json({ quizzes });
    }
    catch (error) {
        res.status(500).json({ error: "Lỗi khi tìm kiếm quizzes" });
    }
}
