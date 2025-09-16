"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.findUserById = findUserById;
exports.findUserByEmail = findUserByEmail;
exports.findUserByUsername = findUserByUsername;
exports.addUser = addUser;
exports.editUser = editUser;
exports.removeUser = removeUser;
const usersRepository_1 = require("../repositories/usersRepository");
async function listUsers() {
    return (0, usersRepository_1.getAllUsers)();
}
async function findUserById(userId) {
    return (0, usersRepository_1.getUserById)(userId);
}
async function findUserByEmail(email) {
    return (0, usersRepository_1.getUserByEmail)(email);
}
async function findUserByUsername(username) {
    return (0, usersRepository_1.getUserByUsername)(username);
}
async function addUser(name, email, password) {
    return (0, usersRepository_1.createUser)(name, email, password);
}
async function editUser(userId, name, password) {
    return (0, usersRepository_1.updateUser)(userId, name, password);
}
async function removeUser(userId) {
    return (0, usersRepository_1.deleteUser)(userId);
}
