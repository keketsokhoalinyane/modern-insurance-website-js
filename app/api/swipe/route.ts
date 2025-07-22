import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db, generateId, type Swipe, type Match } from "@/lib/database"

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const { targetId, direction } = await request.json()

  if (!targetId || !direction || !["like", "dislike"].includes(direction)) {
    return NextResponse.json({ error: "Invalid swipe data" }, { status: 400 })
  }

  // Create swipe record
  const swipeId = generateId()
  const swipe: Swipe = {
    id: swipeId,
    userId,
    targetId,
    direction,
    timestamp: new Date(),
  }

  db.swipes.set(swipeId, swipe)

  // Check for mutual like (match)
  let isMatch = false
  if (direction === "like") {
    const reciprocalSwipe = Array.from(db.swipes.values()).find(
      (s) => s.userId === targetId && s.targetId === userId && s.direction === "like",
    )

    if (reciprocalSwipe) {
      // Create match
      const matchId = generateId()
      const match: Match = {
        id: matchId,
        user1Id: userId,
        user2Id: targetId,
        matchedAt: new Date(),
      }
      db.matches.set(matchId, match)
      isMatch = true
    }
  }

  return NextResponse.json({ success: true, isMatch })
}
