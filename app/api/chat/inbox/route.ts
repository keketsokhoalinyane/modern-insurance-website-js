import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { getUserMatches, getConversation } from "@/lib/database"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const matches = getUserMatches(userId)

  const inbox = matches.map((match) => {
    const conversation = getConversation(userId, match.id)
    const lastMessage = conversation[conversation.length - 1]

    return {
      user: { ...match, password: undefined },
      lastMessage: lastMessage || null,
      unreadCount: conversation.filter((msg) => !msg.read && msg.receiverId === userId).length,
    }
  })

  return NextResponse.json(inbox)
}
