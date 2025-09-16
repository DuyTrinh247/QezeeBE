import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "../repositories/usersRepository";

export async function listUsers(): Promise<User[]> {
  return getAllUsers();
}

export async function findUserById(userId: string): Promise<User | null> {
  return getUserById(userId);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return getUserByEmail(email);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  return getUserByUsername(username);
}

export async function addUser(name: string, email: string, password: string): Promise<User> {
  return createUser(name, email, password);
}

export async function editUser(userId: string, name: string, password: string): Promise<User | null> {
  return updateUser(userId, name, password);
}

export async function removeUser(userId: string): Promise<boolean> {
  return deleteUser(userId);
}


