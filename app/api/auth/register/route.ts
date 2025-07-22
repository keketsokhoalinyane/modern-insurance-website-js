import { type NextRequest, NextResponse } from "next/server"
import { db, generateId, findUserByEmail, type User, createDemoMatches } from "@/lib/database"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, age, gender } = await request.json()

    // Check for missing required fields
    const missingFields = []
    if (!email || email.trim() === "") missingFields.push("email")
    if (!password || password.trim() === "") missingFields.push("password")
    if (!name || name.trim() === "") missingFields.push("name")
    if (!age || age === "" || age === null || age === undefined) missingFields.push("age")
    if (!gender || gender.trim() === "") missingFields.push("gender")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Please fill in the following required fields: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate age
    const ageNum = Number.parseInt(age)
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      return NextResponse.json({ error: "Age must be between 18 and 100" }, { status: 400 })
    }

    // Check if user with this email already exists
    const existingUser = findUserByEmail(email.trim().toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please use a different email or try logging in.",
        },
        { status: 409 },
      )
    }

    // Create user
    const userId = generateId()
    const user: User = {
      id: userId,
      email: email.trim().toLowerCase(),
      password: password.trim(), // In production, hash this password
      name: name.trim(),
      age: ageNum,
      gender: gender.trim() as "male" | "female" | "other",
      bio: "",
      location: "Tembisa, South Africa",
      photos: [],
      videos: [],
      gifs: [],
      hobbies: [],
      firstImpression: "",
      lastSeen: new Date(),
      backgroundImage: "",
      preferences: {
        ageRange: [18, 50],
        gender: "both",
        distance: 50,
      },
      settings: {
        showOnlineStatus: true,
        enableReadReceipts: true,
        chatNotifications: true,
        darkMode: true,
        language: "English",
        privacy: false,
      },
      isPremium: false,
      messageCount: 20, // Free messages per month
      imageUploadCount: 5, // Free image uploads
      planType: "free",
      createdAt: new Date(),
      lastActive: new Date(),
      sessionExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    }

    db.users.set(userId, user)

    // Create demo matches for new users
    createDemoMatches(userId)

    // Generate token
    const token = await signToken({ userId })

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to TembiChat!",
      token,
      user: { ...user, password: undefined },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Something went wrong while creating your account. Please try again.",
      },
      { status: 500 },
    )
  }
}
