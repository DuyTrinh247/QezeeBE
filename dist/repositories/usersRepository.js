"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.getUserByUsername = getUserByUsername;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const db_1 = require("../db");
async function getAllUsers() {
    const result = await db_1.pool.query("SELECT id, name, email, password, google_id, created_at, updated_at FROM users ORDER BY name ASC");
    return result.rows;
}
async function getUserById(userId) {
    var _a;
    const result = await db_1.pool.query("SELECT id, name, email, password, google_id, created_at, updated_at FROM users WHERE id = $1", [userId]);
    return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
}
async function getUserByEmail(email) {
    var _a;
    const result = await db_1.pool.query("SELECT id, name, email, password, google_id, created_at, updated_at FROM users WHERE email = $1", [email]);
    return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
}
async function getUserByUsername(username) {
    var _a;
    const result = await db_1.pool.query("SELECT id, name, email, password, google_id, created_at, updated_at FROM users WHERE name = $1", [username]);
    return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
}
async function createUser(name, email, password) {
    const result = await db_1.pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, password, google_id, created_at, updated_at", [name, email, password]);
    return result.rows[0];
}
async function updateUser(userId, name, password) {
    var _a;
    const result = await db_1.pool.query("UPDATE users SET name = $1, password_hash = $2 WHERE id = $3 RETURNING id, name, email, password_hash, google_id, avatar_url, created_at, updated_at", [name, password, userId]);
    return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
}
async function deleteUser(userId) {
    const result = await db_1.pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return (result.rowCount || 0) > 0;
}
