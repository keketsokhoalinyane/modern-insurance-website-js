import { NextResponse } from "next/server"
import { BANK_DETAILS } from "@/lib/database"

export async function GET() {
  const paymentOptions = [
    {
      id: "fastpay",
      name: "FastPay",
      description: "Instant payment via FastPay",
      icon: "💳",
      processingTime: "Instant",
    },
    {
      id: "ozow",
      name: "Ozow Pay",
      description: "Secure EFT payment",
      icon: "🏦",
      processingTime: "1-2 minutes",
    },
    {
      id: "bank_transfer",
      name: "Direct Bank Transfer",
      description: "Transfer directly to our bank account",
      icon: "🏧",
      processingTime: "Manual verification required",
      bankDetails: BANK_DETAILS,
    },
  ]

  return NextResponse.json(paymentOptions)
}
