"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Tất cả routes users đều cần authentication
router.use(auth_1.authenticateToken);
router.get("/", usersController_1.getUsers);
router.get("/:id", (0, validation_1.validateParams)(schemas_1.userIdSchema), usersController_1.getUser);
router.post("/", (0, validation_1.validateBody)(schemas_1.createUserSchema), usersController_1.createUser);
router.put("/:id", (0, validation_1.validateParams)(schemas_1.userIdSchema), (0, validation_1.validateBody)(schemas_1.updateUserSchema), usersController_1.updateUser);
router.delete("/:id", (0, validation_1.validateParams)(schemas_1.userIdSchema), usersController_1.deleteUser);
exports.default = router;
