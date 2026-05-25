import 'server-only'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // bcryptjs acepta hashes $2a$/$2b$/$2y$ (incl. los de Spring Boot BCrypt)
  return bcrypt.compare(plain, hash)
}
