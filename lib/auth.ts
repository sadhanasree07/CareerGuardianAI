import jwt from "jsonwebtoken";

export const JWT_SECRET =
  process.env.JWT_SECRET || "careerguardian_ai_super_secret_2026";

export function generateToken(user: {
  id: string;
  name: string;
  email: string;
  role?: string;
}) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "student",
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}