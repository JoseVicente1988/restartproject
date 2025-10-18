import bcrypt from "bcryptjs";

// Hash de una contraseña o texto (por ejemplo, respuesta de seguridad)
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

// Comparar un texto con un hash guardado
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
