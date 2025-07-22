import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { getConversation } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId: currentUserId } = authResult
  const { userId: targetUserId } = params

  const conversation = getConversation(currentUserId, targetUserId)

  // Mark messages as read
  conversation.forEach((msg) => {
    if (msg.receiverId === currentUserId) {
      msg.read = true
    }
  })

  return NextResponse.json(conversation)
}
