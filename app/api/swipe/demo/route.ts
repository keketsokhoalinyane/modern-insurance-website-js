import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult

  // Get demo users for swiping
  const demoUsers = ["demo1", "demo2", "demo3"]
  const demoProfiles = []

  // Get users that haven't been swiped on
  const swipedUserIds = Array.from(db.swipes.values())
    .filter((swipe) => swipe.userId === userId)
    .map((swipe) => swipe.targetId)

  for (const demoUserId of demoUsers) {
    if (!swipedUserIds.includes(demoUserId)) {
      const demoUser = db.users.get(demoUserId)
      if (demoUser) {
        demoProfiles.push({ ...demoUser, password: undefined })
      }
    }
  }

  return NextResponse.json(demoProfiles)
}
