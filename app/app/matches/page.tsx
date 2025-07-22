"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"

interface Match {
  id: string
  name: string
  age: number
  photos: string[]
  location: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setError("")
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch("/api/user/matches", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setMatches(data)
      } else if (data.error) {
        setError(data.error)
      } else {
        setError("Invalid response format")
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch matches")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Matches</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchMatches}
            className="gradient-red px-6 py-3 rounded-full text-white font-semibold inline-block"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Your Matches</h1>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Matches Yet</h2>
          <p className="text-gray-400 mb-6">Keep swiping to find your perfect match!</p>
          <Link href="/app" className="gradient-red px-6 py-3 rounded-full text-white font-semibold inline-block">
            Start Swiping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {matches.map((match) => (
            <div key={match.id} className="card-dark rounded-xl overflow-hidden">
              <div className="aspect-[3/4] bg-gray-800 relative">
                {match.photos && match.photos.length > 0 ? (
                  <img
                    src={match.photos[0] || "/placeholder.svg"}
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-gray-400 font-bold">{match.name?.charAt(0) || "?"}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {match.name || "Unknown"}, {match.age || "?"}
                  </h3>
                  <p className="text-gray-300 text-xs">{match.location || "Unknown location"}</p>
                </div>
              </div>

              <div className="p-3">
                <Link
                  href={`/app/messages/${match.id}`}
                  className="w-full gradient-red py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
