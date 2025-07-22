import { SignJWT, jwtVerify } from "jose"
import { db, isSessionValid, updateUserSession } from "./database"

const secret = new TextEncoder().encode("your-secret-key-change-in-production")

export async function signToken(payload: any) {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)

    // Check if user session is still valid
    const user = db.users.get(payload.userId as string)
    if (!user || !isSessionValid(user)) {
      return null
    }

    // Update session
    updateUserSession(payload.userId as string)

    return payload
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}
