import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { user, userId } = authResult

  // Update session expiry
  user.sessionExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  user.lastActive = new Date()
  db.users.set(userId, user)

  return NextResponse.json({ ...user, password: undefined })
}

export async function PUT(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const updates = await request.json()

  const user = db.users.get(userId)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Update allowed fields
  const allowedFields = ["name", "age", "bio", "photos", "preferences"]
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      ;(user as any)[field] = updates[field]
    }
  })

  db.users.set(userId, user)

  return NextResponse.json({ ...user, password: undefined })
}
