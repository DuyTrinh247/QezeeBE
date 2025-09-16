"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Tất cả routes upload đều cần authentication
router.use(auth_1.authenticateToken);
// Upload file
router.post("/", uploadController_1.uploadMiddleware, uploadController_1.uploadFile);
// Delete file
router.delete("/:filename", uploadController_1.deleteFile);
exports.default = router;
