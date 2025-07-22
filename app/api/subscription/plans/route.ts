import { NextResponse } from "next/server"

export async function GET() {
  // Update the plans with new pricing and features
  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 50,
      currency: "ZAR",
      features: ["100 messages per month", "20 image uploads", "Unlimited likes", "Rewind last swipe"],
    },
    {
      id: "plus",
      name: "Plus",
      price: 100,
      currency: "ZAR",
      features: ["300 messages per month", "50 image uploads", "Boost your profile", "Super likes", "Priority support"],
    },
    {
      id: "pro",
      name: "Pro",
      price: 300,
      currency: "ZAR",
      features: [
        "Unlimited messages",
        "Unlimited image uploads",
        "See who liked you",
        "Read receipts",
        "Advanced filters",
        "Incognito mode",
      ],
    },
  ]

  return NextResponse.json(plans)
}
