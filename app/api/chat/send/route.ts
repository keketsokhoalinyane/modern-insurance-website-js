import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db, generateId, type Message } from "@/lib/database"

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const { receiverId, content } = await request.json()

  if (!receiverId || !content) {
    return NextResponse.json({ error: "Receiver and content are required" }, { status: 400 })
  }

  const user = db.users.get(userId)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Check message limit for free users
  if (!user.isPremium && user.messageCount <= 0) {
    return NextResponse.json(
      {
        error: "Message limit reached. Upgrade to premium to send unlimited messages.",
      },
      { status: 403 },
    )
  }

  // Create message
  const messageId = generateId()
  const message: Message = {
    id: messageId,
    senderId: userId,
    receiverId,
    content,
    timestamp: new Date(),
    read: false,
  }

  db.messages.set(messageId, message)

  // Decrease message count for free users
  if (!user.isPremium) {
    user.messageCount--
    db.users.set(userId, user)
  }

  return NextResponse.json({ success: true, message })
}
