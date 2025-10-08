import { Router } from "express";
import { uploadFile, deleteFile, uploadMiddleware } from "../controllers/uploadController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Tất cả routes upload đều cần authentication
router.use(authenticateToken as any);

// Upload file
router.post("/", uploadMiddleware, uploadFile);

// Delete file
router.delete("/:filename", deleteFile);

export default router;
