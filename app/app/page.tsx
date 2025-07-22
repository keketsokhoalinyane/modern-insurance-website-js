"use client"

import { useState, useEffect } from "react"
import { Heart, X, Zap, MapPin } from "lucide-react"
import UserIcon from "lucide-react" // Import the User icon component

interface User {
  id: string
  name: string
  age: number
  bio: string
  photos: string[]
  location: string
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showMatch, setShowMatch] = useState(false)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  // Update the fetchUsers function to include demo users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch regular users
      const response = await fetch("/api/swipe/discover", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch demo users
      const demoResponse = await fetch("/api/swipe/demo", {
        headers: { Authorization: `Bearer ${token}` },
      })

      let allUsers = []

      if (response.ok) {
        const regularUsers = await response.json()
        allUsers = [...allUsers, ...regularUsers]
      }

      if (demoResponse.ok) {
        const demoUsers = await demoResponse.json()
        allUsers = [...allUsers, ...demoUsers]
      }

      // Shuffle the array to mix demo and real users
      const shuffled = allUsers.sort(() => Math.random() - 0.5)
      setUsers(shuffled)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction: "like" | "dislike") => {
    if (currentIndex >= users.length) return

    const currentUser = users[currentIndex]

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetId: currentUser.id,
          direction,
        }),
      })

      const data = await response.json()

      if (data.isMatch && direction === "like") {
        setMatchedUser(currentUser)
        setShowMatch(true)
      }
    } catch (error) {
      console.error("Error swiping:", error)
    }

    setCurrentIndex((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 px-4">
        <Heart className="h-16 w-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No More Profiles</h2>
        <p className="text-gray-400 text-center mb-6">
          {"You've seen everyone in your area. Check back later for new profiles!"}
        </p>
        <button onClick={fetchUsers} className="gradient-red px-6 py-3 rounded-full text-white font-semibold">
          Refresh
        </button>
      </div>
    )
  }

  const currentUser = users[currentIndex]

  return (
    <div className="p-4">
      {/* Match Modal */}
      {showMatch && matchedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-dark p-8 rounded-2xl text-center max-w-sm w-full">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">{"It's a Match!"}</h2>
            <p className="text-gray-300 mb-6">You and {matchedUser.name} liked each other!</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMatch(false)}
                className="flex-1 border border-gray-600 py-3 rounded-full text-gray-300 hover:bg-gray-800"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => {
                  setShowMatch(false)
                  // Navigate to messages
                }}
                className="flex-1 gradient-red py-3 rounded-full text-white font-semibold"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="relative max-w-sm mx-auto">
        <div className="card-dark rounded-2xl overflow-hidden">
          {/* Photo */}
          <div className="aspect-[3/4] bg-gray-800 relative">
            {currentUser.photos.length > 0 ? (
              <img
                src={currentUser.photos[0] || "/placeholder.svg"}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="h-24 w-24 text-gray-600" /> {/* Use the imported User icon component */}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* User info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentUser.name}, {currentUser.age}
              </h2>
              <div className="flex items-center text-gray-300 text-sm mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {currentUser.location}
              </div>
              {currentUser.bio && <p className="text-gray-200 text-sm line-clamp-2">{currentUser.bio}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() => handleSwipe("dislike")}
            className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>

          <button
            onClick={() => handleSwipe("like")}
            className="w-16 h-16 gradient-red rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Heart className="h-7 w-7 text-white" />
          </button>

          <button className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
            <Zap className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
