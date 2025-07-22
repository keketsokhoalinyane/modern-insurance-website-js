import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/middleware"
import { db, generateId, type Payment } from "@/lib/database"

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const { plan, paymentMethod } = await request.json()

  if (!plan || !paymentMethod) {
    return NextResponse.json({ error: "Plan and payment method are required" }, { status: 400 })
  }

  // Plan pricing
  const planPricing = {
    basic: 50,
    plus: 100,
    pro: 300,
  }

  const amount = planPricing[plan as keyof typeof planPricing]
  if (!amount) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  // Create payment record
  const paymentId = generateId()
  const payment: Payment = {
    id: paymentId,
    userId,
    plan,
    amount,
    status: "pending",
    paymentMethod,
    transactionId: generateId(),
    createdAt: new Date(),
  }

  db.payments.set(paymentId, payment)

  // For demo purposes, we'll simulate payment URLs
  let paymentUrl = ""
  if (paymentMethod === "fastpay") {
    paymentUrl = `https://fastpay.co.za/pay?amount=${amount}&reference=${payment.transactionId}`
  } else if (paymentMethod === "ozow") {
    paymentUrl = `https://pay.ozow.com?amount=${amount}&reference=${payment.transactionId}`
  }

  return NextResponse.json({
    success: true,
    paymentId,
    transactionId: payment.transactionId,
    amount,
    paymentUrl,
    status: "pending",
  })
}
