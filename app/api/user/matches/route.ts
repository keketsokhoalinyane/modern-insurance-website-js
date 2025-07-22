import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { getUserMatches } from "@/lib/database"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult

  try {
    const matches = getUserMatches(userId)

    // Return matches without password field
    const safeMatches = matches.map((match) => ({
      ...match,
      password: undefined,
    }))

    return NextResponse.json(safeMatches)
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}
