import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromRequest } from "./jwt"
import { db } from "./database"

export async function authMiddleware(request: NextRequest) {
  const token = getTokenFromRequest(request)

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const user = db.users.get(payload.userId as string)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return { user, userId: payload.userId as string }
}
