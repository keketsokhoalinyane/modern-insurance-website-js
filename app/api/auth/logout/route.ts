// Create logout API endpoint
import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult

  // Invalidate user session
  const user = db.users.get(userId)
  if (user) {
    user.sessionExpiry = new Date(0) // Set to past date
    db.users.set(userId, user)
  }

  return NextResponse.json({ success: true, message: "Logged out successfully" })
}
