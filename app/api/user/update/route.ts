import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db } from "@/lib/database"

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
  const allowedFields = [
    "name",
    "age",
    "bio",
    "photos",
    "videos",
    "gifs",
    "hobbies",
    "firstImpression",
    "backgroundImage",
    "preferences",
    "settings",
  ]

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      ;(user as any)[field] = updates[field]
    }
  })

  // Update last active time
  user.lastActive = new Date()
  user.sessionExpiry = new Date(Date.now() + 10 * 60 * 1000) // Extend session by 10 minutes

  db.users.set(userId, user)

  return NextResponse.json({ ...user, password: undefined })
}
