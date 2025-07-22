"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import NetworkStatus from "@/components/NetworkStatus"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const data = await apiClient.post("/auth/login", formData)

      setSuccess(data.message || "Welcome back!")
      apiClient.setToken(data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/app")
      }, 1000)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <NetworkStatus />

      <div className="max-w-md w-full">
        <div className="card-dark p-8 rounded-2xl">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2">Sign in to continue your journey</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                placeholder="your@email.com"
                disabled={loading}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none pr-12"
                  placeholder="Your password"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-red py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin h-4 w-4" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {"Don't have an account?"}{" "}
              <Link href="/register" className="text-red-400 hover:text-red-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link href="#" className="text-sm text-gray-500 hover:text-red-400 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
