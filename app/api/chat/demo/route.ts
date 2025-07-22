import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db, generateId } from "@/lib/database"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult

  // Get demo users
  const demoUsers = ["demo1", "demo2", "demo3"]
  const demoChats = []

  for (const demoUserId of demoUsers) {
    const demoUser = db.users.get(demoUserId)
    if (demoUser) {
      // Create demo messages if they don't exist
      const existingMessages = Array.from(db.messages.values()).filter(
        (msg) =>
          (msg.senderId === demoUserId && msg.receiverId === userId) ||
          (msg.senderId === userId && msg.receiverId === demoUserId),
      )

      if (existingMessages.length === 0) {
        // Create a demo message
        const demoMessage = {
          id: generateId(),
          senderId: demoUserId,
          receiverId: userId,
          content: `Hey! I see you're new here. Upgrade to Pro to unlock unlimited chats and see who likes you! 😘`,
          timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random time in last hour
          read: false,
          isDemo: true,
        }
        db.messages.set(demoMessage.id, demoMessage)
      }

      const conversation = Array.from(db.messages.values())
        .filter(
          (msg) =>
            (msg.senderId === demoUserId && msg.receiverId === userId) ||
            (msg.senderId === userId && msg.receiverId === demoUserId),
        )
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      const lastMessage = conversation[0]

      demoChats.push({
        user: { ...demoUser, password: undefined },
        lastMessage: lastMessage || null,
        unreadCount: conversation.filter((msg) => !msg.read && msg.receiverId === userId).length,
      })
    }
  }

  return NextResponse.json(demoChats)
}
