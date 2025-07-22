// In-memory database simulation (replace with real database in production)
export interface User {
  id: string
  email: string
  password: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  bio: string
  location: string
  photos: string[]
  videos: string[]
  gifs: string[]
  hobbies: string[]
  firstImpression: string
  lastSeen: Date
  backgroundImage: string
  preferences: {
    ageRange: [number, number]
    gender: "male" | "female" | "both"
    distance: number
  }
  settings: {
    showOnlineStatus: boolean
    enableReadReceipts: boolean
    chatNotifications: boolean
    darkMode: boolean
    language: string
    privacy: boolean
  }
  isPremium: boolean
  messageCount: number
  imageUploadCount: number
  planType: "free" | "basic" | "plus" | "pro"
  createdAt: Date
  lastActive: Date
  sessionExpiry: Date
}

export interface Swipe {
  id: string
  userId: string
  targetId: string
  direction: "like" | "dislike"
  timestamp: Date
}

export interface Match {
  id: string
  user1Id: string
  user2Id: string
  matchedAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
  isDemo: boolean
}

export interface Payment {
  id: string
  userId: string
  plan: "basic" | "plus" | "pro"
  amount: number
  status: "pending" | "completed" | "failed"
  paymentMethod: "fastpay" | "ozow" | "bank_transfer"
  transactionId: string
  createdAt: Date
}

// In-memory storage (replace with real database)
export const db = {
  users: new Map<string, User>(),
  swipes: new Map<string, Swipe>(),
  matches: new Map<string, Match>(),
  messages: new Map<string, Message>(),
  payments: new Map<string, Payment>(),
}

// YOUR BANK ACCOUNT - Replace these details as needed
export const BANK_DETAILS = {
  bankName: "Tymbank",
  accountNumber: "51057149240",
  cardNumber: "4847 9582 6022 7572",
}

// WhatsApp notification number
export const WHATSAPP_NOTIFICATION = "068 142 5400"

// Helper functions
export const generateId = () => Math.random().toString(36).substr(2, 9)

export const findUserByEmail = (email: string): User | undefined => {
  return Array.from(db.users.values()).find((user) => user.email === email.toLowerCase())
}

export const getUserMatches = (userId: string): User[] => {
  const userMatches = Array.from(db.matches.values()).filter(
    (match) => match.user1Id === userId || match.user2Id === userId,
  )

  return userMatches
    .map((match) => {
      const matchedUserId = match.user1Id === userId ? match.user2Id : match.user1Id
      return db.users.get(matchedUserId)!
    })
    .filter(Boolean)
}

export const getConversation = (user1Id: string, user2Id: string): Message[] => {
  return Array.from(db.messages.values())
    .filter(
      (msg) =>
        (msg.senderId === user1Id && msg.receiverId === user2Id) ||
        (msg.senderId === user2Id && msg.receiverId === user1Id),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

// Create demo matches for testing
export const createDemoMatches = (userId: string) => {
  const demoUsers = ["demo1", "demo2", "demo3"]

  demoUsers.forEach((demoUserId) => {
    // Check if match already exists
    const existingMatch = Array.from(db.matches.values()).find(
      (match) =>
        (match.user1Id === userId && match.user2Id === demoUserId) ||
        (match.user1Id === demoUserId && match.user2Id === userId),
    )

    if (!existingMatch) {
      // Create a match between the user and demo user
      const matchId = generateId()
      const match: Match = {
        id: matchId,
        user1Id: userId,
        user2Id: demoUserId,
        matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
      }
      db.matches.set(matchId, match)
    }
  })
}

// Create demo users
export const createDemoUsers = () => {
  const demoUsers = [
    {
      id: "demo1",
      email: "demo1@tembichat.com",
      password: "demo123",
      name: "Thandi",
      age: 24,
      gender: "female" as const,
      bio: "Love dancing and good vibes! Looking for someone special 💕",
      location: "Tembisa, South Africa",
      photos: ["/placeholder.svg?height=400&width=300"],
      videos: [],
      gifs: [],
      hobbies: ["Dancing", "Music", "Cooking", "Fitness"],
      firstImpression: "Bubbly and energetic",
      lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      backgroundImage: "/placeholder.svg?height=200&width=400",
      preferences: {
        ageRange: [22, 35] as [number, number],
        gender: "male" as const,
        distance: 25,
      },
      settings: {
        showOnlineStatus: true,
        enableReadReceipts: true,
        chatNotifications: true,
        darkMode: true,
        language: "English",
        privacy: false,
      },
      isPremium: true,
      messageCount: 999,
      imageUploadCount: 999,
      planType: "pro" as const,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: "demo2",
      email: "demo2@tembichat.com",
      password: "demo123",
      name: "Sipho",
      age: 28,
      gender: "male" as const,
      bio: "Entrepreneur and fitness enthusiast. Let's build something together! 💪",
      location: "Tembisa, South Africa",
      photos: ["/placeholder.svg?height=400&width=300"],
      videos: [],
      gifs: [],
      hobbies: ["Business", "Gym", "Travel", "Photography"],
      firstImpression: "Ambitious and driven",
      lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      backgroundImage: "/placeholder.svg?height=200&width=400",
      preferences: {
        ageRange: [20, 30] as [number, number],
        gender: "female" as const,
        distance: 30,
      },
      settings: {
        showOnlineStatus: true,
        enableReadReceipts: true,
        chatNotifications: true,
        darkMode: true,
        language: "English",
        privacy: false,
      },
      isPremium: true,
      messageCount: 999,
      imageUploadCount: 999,
      planType: "pro" as const,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 2 * 60 * 1000),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: "demo3",
      email: "demo3@tembichat.com",
      password: "demo123",
      name: "Nomsa",
      age: 26,
      gender: "female" as const,
      bio: "Artist and dreamer. Love deep conversations and good food 🎨",
      location: "Tembisa, South Africa",
      photos: ["/placeholder.svg?height=400&width=300"],
      videos: [],
      gifs: [],
      hobbies: ["Art", "Reading", "Cooking", "Nature"],
      firstImpression: "Creative and thoughtful",
      lastSeen: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      backgroundImage: "/placeholder.svg?height=200&width=400",
      preferences: {
        ageRange: [24, 35] as [number, number],
        gender: "both" as const,
        distance: 20,
      },
      settings: {
        showOnlineStatus: true,
        enableReadReceipts: true,
        chatNotifications: true,
        darkMode: true,
        language: "English",
        privacy: false,
      },
      isPremium: true,
      messageCount: 999,
      imageUploadCount: 999,
      planType: "pro" as const,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 10 * 60 * 1000),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ]

  demoUsers.forEach((user) => {
    if (!db.users.has(user.id)) {
      db.users.set(user.id, user)
    }
  })

  // Create demo messages
  const demoMessages = [
    {
      id: "msg1",
      senderId: "demo1",
      receiverId: "user1", // Will be replaced with actual user ID
      content: "Hey! I see you're new here. Upgrade to Pro to unlock unlimited chats and see who likes you! 😘",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      isDemo: true,
    },
    {
      id: "msg2",
      senderId: "demo2",
      receiverId: "user1",
      content: "What's up! Pro members get the best experience here. Want to chat more? 💪",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false,
      isDemo: true,
    },
    {
      id: "msg3",
      senderId: "demo3",
      receiverId: "user1",
      content: "Hi there! I love connecting with new people. Upgrade to Pro for unlimited messages! 🎨",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: false,
      isDemo: true,
    },
  ]

  demoMessages.forEach((msg) => {
    if (!db.messages.has(msg.id)) {
      db.messages.set(msg.id, msg)
    }
  })
}

// Initialize demo users
createDemoUsers()

export const isSessionValid = (user: User): boolean => {
  return user.sessionExpiry > new Date()
}

export const updateUserSession = (userId: string) => {
  const user = db.users.get(userId)
  if (user) {
    user.lastActive = new Date()
    user.sessionExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    db.users.set(userId, user)
  }
}
