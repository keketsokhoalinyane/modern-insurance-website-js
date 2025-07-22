"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import NetworkStatus from "@/components/NetworkStatus"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    setFieldErrors([])

    try {
      const data = await apiClient.post("/auth/register", {
        ...formData,
        age: formData.age ? Number.parseInt(formData.age) : "",
      })

      setSuccess(data.message || "Account created successfully!")
      apiClient.setToken(data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/profile-setup")
      }, 1500)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")

      // Handle field-specific errors
      if (err.missingFields) {
        setFieldErrors(err.missingFields)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Clear field-specific errors when user starts typing
    if (fieldErrors.includes(field)) {
      setFieldErrors(fieldErrors.filter((f) => f !== field))
    }

    // Clear general error when user makes changes
    if (error) {
      setError("")
    }
  }

  const getFieldError = (field: string) => {
    return fieldErrors.includes(field)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <NetworkStatus />

      <div className="max-w-md w-full">
        <div className="card-dark p-8 rounded-2xl">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Join TembiChat</h1>
            <p className="text-gray-400 mt-2">Find your perfect match in Tembisa</p>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email {getFieldError("email") && <span className="text-red-400">*</span>}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none ${
                  getFieldError("email")
                    ? "border-red-600 focus:border-red-500"
                    : "border-gray-700 focus:border-red-600"
                }`}
                placeholder="your@email.com"
                disabled={loading}
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name {getFieldError("name") && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none ${
                  getFieldError("name") ? "border-red-600 focus:border-red-500" : "border-gray-700 focus:border-red-600"
                }`}
                placeholder="Your full name"
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age {getFieldError("age") && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none ${
                    getFieldError("age")
                      ? "border-red-600 focus:border-red-500"
                      : "border-gray-700 focus:border-red-600"
                  }`}
                  placeholder="25"
                  disabled={loading}
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender {getFieldError("gender") && <span className="text-red-400">*</span>}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none ${
                    getFieldError("gender")
                      ? "border-red-600 focus:border-red-500"
                      : "border-gray-700 focus:border-red-600"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password {getFieldError("password") && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none pr-12 ${
                    getFieldError("password")
                      ? "border-red-600 focus:border-red-500"
                      : "border-gray-700 focus:border-red-600"
                  }`}
                  placeholder="Create a strong password"
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-red py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin h-4 w-4" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our <span className="text-red-400">Terms of Service</span> and{" "}
              <span className="text-red-400">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
