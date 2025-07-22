"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Heart } from "lucide-react"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

interface ChatUser {
  id: string
  name: string
  photos: string[]
}

export default function ChatPage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUserId(user.id)
      setCanSendMessage(user.isPremium || user.messageCount > 0)
    }

    fetchMessages()
    fetchChatUser()
  }, [params.userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/chat/${params.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatUser = async () => {
    // In a real app, you'd fetch user details from an API
    // For now, we'll simulate it
    setChatUser({
      id: params.userId,
      name: "Chat User",
      photos: [],
    })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !canSendMessage) return

    setSending(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: params.userId,
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")

        // Update user's message count
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          if (!user.isPremium) {
            user.messageCount = Math.max(0, user.messageCount - 1)
            localStorage.setItem("user", JSON.stringify(user))
            setCanSendMessage(user.messageCount > 0)
          }
        }
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
          {chatUser?.photos.length ? (
            <img
              src={chatUser.photos[0] || "/placeholder.svg"}
              alt={chatUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 font-semibold">{chatUser?.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-white">{chatUser?.name}</h2>
          <p className="text-xs text-gray-400">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <p className="text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === currentUserId ? "gradient-red text-white" : "bg-gray-800 text-white"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        {!canSendMessage && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 mb-3">
            <p className="text-red-400 text-sm">
              {"You've reached your message limit. Upgrade to premium to continue chatting."}
            </p>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={canSendMessage ? "Type a message..." : "Upgrade to send messages"}
            disabled={!canSendMessage || sending}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white focus:border-red-600 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !canSendMessage}
            className="gradient-red p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
