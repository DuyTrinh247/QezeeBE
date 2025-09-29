import {
  QuizzesRepository,
  Quiz,
  CreateQuizData,
  UpdateQuizData,
} from "../repositories/quizzesRepository";

const quizzesRepo = new QuizzesRepository();

export async function listQuizzes(): Promise<Quiz[]> {
  return quizzesRepo.findAll();
}

export async function findQuizById(quizId: string): Promise<Quiz | null> {
  return quizzesRepo.findById(quizId);
}

export async function findQuizByPdfFileId(pdfFileId: string): Promise<Quiz | null> {
  return quizzesRepo.findByPdfFileId(pdfFileId);
}

export async function addQuiz(quizData: CreateQuizData): Promise<Quiz> {
  return quizzesRepo.create(quizData);
}

export async function editQuiz(quizId: string, quizData: UpdateQuizData): Promise<Quiz | null> {
  // Kiểm tra xem quiz có tồn tại không
  const existingQuiz = await quizzesRepo.findById(quizId);
  if (!existingQuiz) {
    throw new Error("Quiz không tồn tại");
  }

  return quizzesRepo.update(quizId, quizData);
}

export async function removeQuiz(quizId: string): Promise<boolean> {
  const existingQuiz = await quizzesRepo.findById(quizId);
  if (!existingQuiz) {
    throw new Error("Quiz không tồn tại");
  }
  
  return quizzesRepo.delete(quizId);
}

export async function getQuizzesByUserId(userId: string, limit?: number, offset?: number): Promise<Quiz[]> {
  return quizzesRepo.findByUserId(userId, limit, offset);
}

export async function searchQuizzesByContent(searchTerm: string, userId?: string): Promise<Quiz[]> {
  return quizzesRepo.searchQuizzes(searchTerm, userId);
}

// Export service object for use in other controllers
export const quizzesService = {
  createQuiz: addQuiz,
  updateQuiz: editQuiz,
  deleteQuiz: removeQuiz,
  getQuizById: findQuizById,
  getQuizzesByUserId,
  searchQuizzes: searchQuizzesByContent,
  listQuizzes
};
