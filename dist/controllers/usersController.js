"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const usersService_1 = require("../services/usersService");
async function getUsers(_req, res) {
    const users = await (0, usersService_1.listUsers)();
    res.status(200).json({ users });
}
async function getUser(req, res) {
    const id = req.params.id;
    if (!id)
        return res.status(400).json({ error: "Invalid id" });
    const user = await (0, usersService_1.findUserById)(id);
    if (!user)
        return res.status(404).json({ error: "Not found" });
    res.status(200).json({ user });
}
async function createUser(req, res) {
    var _a;
    const { name, email, password } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (!name || typeof name !== "string")
        return res.status(400).json({ error: "name is required" });
    if (!email || typeof email !== "string")
        return res.status(400).json({ error: "email is required" });
    if (!password || typeof password !== "string")
        return res.status(400).json({ error: "password is required" });
    // Hash password
    const bcrypt = await Promise.resolve().then(() => __importStar(require("bcrypt")));
    const password_hash = await bcrypt.hash(password, 10);
    const user = await (0, usersService_1.addUser)(name, email, password_hash);
    res.status(201).json({ user });
}
async function updateUser(req, res) {
    var _a;
    const id = req.params.id;
    const { name, password } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (!id)
        return res.status(400).json({ error: "Invalid id" });
    if (!name || typeof name !== "string")
        return res.status(400).json({ error: "name is required" });
    if (!password || typeof password !== "string")
        return res.status(400).json({ error: "password is required" });
    const user = await (0, usersService_1.editUser)(id, name, password);
    if (!user)
        return res.status(404).json({ error: "Not found" });
    res.status(200).json({ user });
}
async function deleteUser(req, res) {
    const id = req.params.id;
    if (!id)
        return res.status(400).json({ error: "Invalid id" });
    const ok = await (0, usersService_1.removeUser)(id);
    if (!ok)
        return res.status(404).json({ error: "Not found" });
    res.status(204).send();
}
