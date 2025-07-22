import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, getUserMatches, createDemoMatches } from "@/lib/database"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Check for missing fields
    if (!email || email.trim() === "") {
      return NextResponse.json({ error: "Please enter your email address" }, { status: 400 })
    }

    if (!password || password.trim() === "") {
      return NextResponse.json({ error: "Please enter your password" }, { status: 400 })
    }

    // Find user by email (case insensitive)
    const user = findUserByEmail(email.trim().toLowerCase())

    if (!user) {
      return NextResponse.json(
        {
          error: "No account found with this email address. Please check your email or create a new account.",
        },
        { status: 401 },
      )
    }

    // Check password
    if (user.password !== password.trim()) {
      // In production, compare hashed passwords
      return NextResponse.json(
        {
          error: "Incorrect password. Please try again.",
        },
        { status: 401 },
      )
    }

    // Update last active and session
    user.lastActive = new Date()
    user.sessionExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Ensure user has demo matches
    const existingMatches = getUserMatches(user.id)
    if (existingMatches.length === 0) {
      createDemoMatches(user.id)
    }

    const token = await signToken({ userId: user.id })

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: { ...user, password: undefined },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Something went wrong while signing you in. Please try again.",
      },
      { status: 500 },
    )
  }
}
