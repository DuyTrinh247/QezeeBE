import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { 
  addQuiz, 
  editQuiz, 
  findQuizById, 
  findQuizByPdfFileId,
  listQuizzes, 
  removeQuiz,
  getQuizzesByUserId,
  searchQuizzesByContent
} from "../services/quizzesService";
import { createQuizSchema, updateQuizSchema } from "../validation/schemas";

export async function getQuizzes(req: AuthRequest, res: Response) {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log('🔍 Getting quizzes for user:', userId);
    
    // Get quizzes for this specific user
    const quizzes = await getQuizzesByUserId(userId);
    
    console.log('📊 Found quizzes:', quizzes.length);
    
    res.status(200).json({ 
      quizzes,
      total: quizzes.length,
      message: `Found ${quizzes.length} quizzes for user ${userId}`
    });
  } catch (error) {
    console.error('❌ Error getting user quizzes:', error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách quizzes" });
  }
}

export async function getQuiz(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "ID không hợp lệ" });
    
    const quiz = await findQuizById(id);
    if (!quiz) return res.status(404).json({ error: "Không tìm thấy quiz" });
    
    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy quiz" });
  }
}

export async function getQuizByHash(req: Request, res: Response) {
  try {
    const hashcode = req.params.hashcode;
    if (!hashcode) return res.status(400).json({ error: "Hashcode không hợp lệ" });
    
    const quiz = await findQuizByPdfFileId(hashcode); // TODO: Update logic for hashcode search
    if (!quiz) return res.status(404).json({ error: "Không tìm thấy quiz với hashcode này" });
    
    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy quiz theo hashcode" });
  }
}

export async function createQuiz(req: AuthRequest, res: Response) {
  try {
    // Validate request body
    const validationResult = createQuizSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation error",
        details: validationResult.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const validatedData = validationResult.data;
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const quiz = await addQuiz({
      user_id: req.user.userId,
      ...validatedData,
      time_limit: validatedData.time_limit, // Use time_limit directly
      quiz_data: validatedData.quiz_data || {}
    });
    res.status(201).json({ quiz });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Error creating quiz" });
    }
  }
}

export async function updateQuiz(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { ngay_tao, json, thoi_gian, hashcode } = req.body ?? {};
    
    if (!id) return res.status(400).json({ error: "ID không hợp lệ" });

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

    const quiz = await editQuiz(id, { 
      title: "Updated Quiz", // TODO: Get from request
      quiz_data: json 
    });
    if (!quiz) return res.status(404).json({ error: "Không tìm thấy quiz" });
    
    res.status(200).json({ quiz });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Lỗi khi cập nhật quiz" });
    }
  }
}

export async function deleteQuiz(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "ID không hợp lệ" });
    
    const ok = await removeQuiz(id);
    if (!ok) return res.status(404).json({ error: "Không tìm thấy quiz" });
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Lỗi khi xóa quiz" });
    }
  }
}

export async function getQuizzesByDateRange(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate và endDate là bắt buộc" });
    }
    
    if (typeof startDate !== "string" || typeof endDate !== "string") {
      return res.status(400).json({ error: "startDate và endDate phải là string" });
    }

    const quizzes = await getQuizzesByUserId("temp-user-id"); // TODO: Update logic for date range search
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy quizzes theo khoảng thời gian" });
  }
}

export async function searchQuizzes(req: Request, res: Response) {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Tham số tìm kiếm 'q' là bắt buộc" });
    }

    const quizzes = await searchQuizzesByContent(q);
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm quizzes" });
  }
}
