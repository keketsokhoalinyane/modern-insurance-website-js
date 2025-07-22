import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db, WHATSAPP_NOTIFICATION } from "@/lib/database"

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const { paymentId, transactionId } = await request.json()

  if (!paymentId || !transactionId) {
    return NextResponse.json({ error: "Payment ID and transaction ID are required" }, { status: 400 })
  }

  const payment = db.payments.get(paymentId)
  if (!payment || payment.userId !== userId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  // Update payment status
  payment.status = "completed"
  db.payments.set(paymentId, payment)

  // Update user plan
  const user = db.users.get(userId)
  if (user) {
    user.planType = payment.plan as any
    user.isPremium = true

    // Update message and image limits based on plan
    if (payment.plan === "basic") {
      user.messageCount = 100
      user.imageUploadCount = 20
    } else if (payment.plan === "plus") {
      user.messageCount = 300
      user.imageUploadCount = 50
    } else if (payment.plan === "pro") {
      user.messageCount = 999999 // Unlimited
      user.imageUploadCount = 999999 // Unlimited
    }

    db.users.set(userId, user)
  }

  // Send WhatsApp notification (in production, integrate with WhatsApp Business API)
  console.log(
    `WhatsApp notification to ${WHATSAPP_NOTIFICATION}: Payment received for ${payment.plan} by ${user?.name || userId}. TembiChat access updated.`,
  )

  return NextResponse.json({
    success: true,
    message: "Payment confirmed and plan upgraded",
    newPlan: payment.plan,
  })
}
