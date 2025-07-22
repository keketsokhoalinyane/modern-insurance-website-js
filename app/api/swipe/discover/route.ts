import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const user = db.users.get(userId)

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Get users that haven't been swiped on
  const swipedUserIds = Array.from(db.swipes.values())
    .filter((swipe) => swipe.userId === userId)
    .map((swipe) => swipe.targetId)

  const potentialMatches = Array.from(db.users.values())
    .filter(
      (u) =>
        u.id !== userId &&
        !swipedUserIds.includes(u.id) &&
        u.age >= user.preferences.ageRange[0] &&
        u.age <= user.preferences.ageRange[1] &&
        (user.preferences.gender === "both" || u.gender === user.preferences.gender),
    )
    .slice(0, 10) // Limit to 10 users
    .map((u) => ({ ...u, password: undefined }))

  return NextResponse.json(potentialMatches)
}
