"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizzesService = void 0;
exports.listQuizzes = listQuizzes;
exports.findQuizById = findQuizById;
exports.findQuizByPdfFileId = findQuizByPdfFileId;
exports.addQuiz = addQuiz;
exports.editQuiz = editQuiz;
exports.removeQuiz = removeQuiz;
exports.getQuizzesByUserId = getQuizzesByUserId;
exports.searchQuizzesByContent = searchQuizzesByContent;
const quizzesRepository_1 = require("../repositories/quizzesRepository");
const quizzesRepo = new quizzesRepository_1.QuizzesRepository();
async function listQuizzes() {
    return quizzesRepo.findAll();
}
async function findQuizById(quizId) {
    return quizzesRepo.findById(quizId);
}
async function findQuizByPdfFileId(pdfFileId) {
    return quizzesRepo.findByPdfFileId(pdfFileId);
}
async function addQuiz(quizData) {
    return quizzesRepo.create(quizData);
}
async function editQuiz(quizId, quizData) {
    // Kiểm tra xem quiz có tồn tại không
    const existingQuiz = await quizzesRepo.findById(quizId);
    if (!existingQuiz) {
        throw new Error("Quiz không tồn tại");
    }
    return quizzesRepo.update(quizId, quizData);
}
async function removeQuiz(quizId) {
    const existingQuiz = await quizzesRepo.findById(quizId);
    if (!existingQuiz) {
        throw new Error("Quiz không tồn tại");
    }
    return quizzesRepo.delete(quizId);
}
async function getQuizzesByUserId(userId, limit, offset) {
    return quizzesRepo.findByUserId(userId, limit, offset);
}
async function searchQuizzesByContent(searchTerm, userId) {
    return quizzesRepo.searchQuizzes(searchTerm, userId);
}
// Export service object for use in other controllers
exports.quizzesService = {
    createQuiz: addQuiz,
    updateQuiz: editQuiz,
    deleteQuiz: removeQuiz,
    getQuizById: findQuizById,
    getQuizzesByUserId,
    searchQuizzes: searchQuizzesByContent,
    listQuizzes
};
