"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageCircle, Crown } from "lucide-react"

interface ChatPreview {
  user: {
    id: string
    name: string
    photos: string[]
  }
  lastMessage: {
    content: string
    timestamp: string
  } | null
  unreadCount: number
}

export default function MessagesPage() {
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    fetchChats()
    fetchMessageCount()
  }, [])

  // Update the fetchChats function to include demo chats
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch regular chats
      const response = await fetch("/api/chat/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch demo chats
      const demoResponse = await fetch("/api/chat/demo", {
        headers: { Authorization: `Bearer ${token}` },
      })

      let allChats = []

      if (response.ok) {
        const regularChats = await response.json()
        allChats = [...allChats, ...regularChats]
      }

      if (demoResponse.ok) {
        const demoChats = await demoResponse.json()
        allChats = [...allChats, ...demoChats]
      }

      // Sort by last message time
      allChats.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0
        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0
        return bTime - aTime
      })

      setChats(allChats)
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessageCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMessageCount(data.messageCount)
      }
    } catch (error) {
      console.error("Error fetching message count:", error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Messages</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            {messageCount > 0 ? `${messageCount} messages remaining` : "No messages left"}
          </p>
          {messageCount <= 5 && (
            <Link
              href="/app/subscription"
              className="flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1 rounded-full text-xs font-semibold text-black"
            >
              <Crown className="h-3 w-3" />
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Message limit warning */}
      {messageCount === 0 && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">Message Limit Reached</h3>
          <p className="text-red-300 text-sm mb-3">
            {"You've used all your free messages for this month. Upgrade to premium to send unlimited messages."}
          </p>
          <Link
            href="/app/subscription"
            className="gradient-red px-4 py-2 rounded-lg text-white text-sm font-semibold inline-block"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Chat List */}
      {chats.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Messages Yet</h2>
          <p className="text-gray-400">Start matching with people to begin conversations!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <Link key={chat.user.id} href={`/app/messages/${chat.user.id}`} className="block">
              <div className="card-dark p-4 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                    {chat.user.photos.length > 0 ? (
                      <img
                        src={chat.user.photos[0] || "/placeholder.svg"}
                        alt={chat.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 font-semibold">{chat.user.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate">{chat.user.name}</h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">{chat.lastMessage?.content || "Say hello! 👋"}</p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
