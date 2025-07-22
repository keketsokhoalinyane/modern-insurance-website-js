"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Heart, MessageCircle, User, Home, Crown } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { onNetworkChange } from "@/lib/network"
import NetworkStatus from "@/components/NetworkStatus"

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    setUser(user)
    setLoading(false)

    // Set token in API client
    apiClient.setToken(token)

    // Check session validity every minute
    const sessionCheck = setInterval(async () => {
      try {
        const updatedUser = await apiClient.get("/user/profile")
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      } catch (error) {
        console.log("Session expired")
        apiClient.clearToken()
        localStorage.removeItem("user")
        router.push("/login")
        clearInterval(sessionCheck)
      }
    }, 60000) // Check every minute

    // Listen for network changes
    const networkCleanup = onNetworkChange((isOnline) => {
      if (isOnline) {
        // Refresh user data when back online
        apiClient
          .get("/user/profile")
          .then((updatedUser) => {
            setUser(updatedUser)
            localStorage.setItem("user", JSON.stringify(updatedUser))
          })
          .catch(() => {
            // Session might be expired
            router.push("/login")
          })
      }
    })

    return () => {
      clearInterval(sessionCheck)
      networkCleanup()
    }
  }, [router])

  const navItems = [
    { href: "/app", icon: Home, label: "Discover" },
    { href: "/app/matches", icon: Heart, label: "Matches" },
    { href: "/app/messages", icon: MessageCircle, label: "Messages" },
    { href: "/app/profile", icon: User, label: "Profile" },
  ]

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <NetworkStatus />

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-900/20">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-lg font-bold text-white">TembiChat</span>
            </div>
            {!user.isPremium && (
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
      </nav>

      {/* Main Content */}
      <main className="pt-16 pb-20 max-w-md mx-auto">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-black/90 backdrop-blur-md border-t border-red-900/20">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive ? "text-red-400 bg-red-900/20" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
