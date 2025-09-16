import { Request, Response } from "express";
import { addUser, editUser, findUserById, listUsers, removeUser } from "../services/usersService";

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers();
  res.status(200).json({ users });
}

export async function getUser(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const user = await findUserById(id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.status(200).json({ user });
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password } = req.body ?? {};
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  if (!email || typeof email !== "string") return res.status(400).json({ error: "email is required" });
  if (!password || typeof password !== "string") return res.status(400).json({ error: "password is required" });
  
  // Hash password
  const bcrypt = await import("bcrypt");
  const password_hash = await bcrypt.hash(password, 10);
  
  const user = await addUser(name, email, password_hash);
  res.status(201).json({ user });
}

export async function updateUser(req: Request, res: Response) {
  const id = req.params.id;
  const { name, password } = req.body ?? {};
  if (!id) return res.status(400).json({ error: "Invalid id" });
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  if (!password || typeof password !== "string") return res.status(400).json({ error: "password is required" });
  const user = await editUser(id, name, password);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.status(200).json({ user });
}

export async function deleteUser(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const ok = await removeUser(id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
}


