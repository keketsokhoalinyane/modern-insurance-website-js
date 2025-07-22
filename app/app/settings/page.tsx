"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Moon, Sun, Globe, Shield, Bell, Eye, MessageSquare } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    enableReadReceipts: true,
    chatNotifications: true,
    darkMode: true,
    language: "English",
    privacy: false,
  })
  const [preferences, setPreferences] = useState({
    ageRange: [18, 50] as [number, number],
    gender: "both",
    distance: 50,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setSettings(parsedUser.settings || settings)
      setPreferences(parsedUser.preferences || preferences)
    }
  }, [])

  const updateSettings = async (newSettings: any) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: newSettings,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error updating settings:", error)
    }
  }

  const updatePreferences = async (newPreferences: any) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferences: newPreferences,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateSettings(newSettings)
  }

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    updatePreferences(newPreferences)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Discovery Preferences */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Discovery Preferences</h2>

        <div className="space-y-4">
          <div className="card-dark p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">Interested In</label>
            <select
              value={preferences.gender}
              onChange={(e) => handlePreferenceChange("gender", e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
            >
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="both">Everyone</option>
            </select>
          </div>

          <div className="card-dark p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Age Range: {preferences.ageRange[0]} - {preferences.ageRange[1]}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="18"
                max="100"
                value={preferences.ageRange[0]}
                onChange={(e) =>
                  handlePreferenceChange("ageRange", [Number.parseInt(e.target.value), preferences.ageRange[1]])
                }
                className="flex-1"
              />
              <input
                type="range"
                min="18"
                max="100"
                value={preferences.ageRange[1]}
                onChange={(e) =>
                  handlePreferenceChange("ageRange", [preferences.ageRange[0], Number.parseInt(e.target.value)])
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="card-dark p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Distance: {preferences.distance}km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={preferences.distance}
              onChange={(e) => handlePreferenceChange("distance", Number.parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Privacy & Activity</h2>

        <div className="space-y-3">
          <div className="card-dark p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-white font-medium">Show Online Status</h3>
                <p className="text-gray-400 text-sm">Let others see when you're active</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange("showOnlineStatus", !settings.showOnlineStatus)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.showOnlineStatus ? "bg-red-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.showOnlineStatus ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="card-dark p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-white font-medium">Read Receipts</h3>
                <p className="text-gray-400 text-sm">Show when you've read messages</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange("enableReadReceipts", !settings.enableReadReceipts)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableReadReceipts ? "bg-red-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.enableReadReceipts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="card-dark p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-white font-medium">Privacy Mode</h3>
                <p className="text-gray-400 text-sm">Hide your profile from search</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange("privacy", !settings.privacy)}
              className={`w-12 h-6 rounded-full transition-colors ${settings.privacy ? "bg-red-600" : "bg-gray-600"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.privacy ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>

        <div className="card-dark p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="text-white font-medium">Chat Notifications</h3>
              <p className="text-gray-400 text-sm">Get notified of new messages</p>
            </div>
          </div>
          <button
            onClick={() => handleSettingChange("chatNotifications", !settings.chatNotifications)}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.chatNotifications ? "bg-red-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.chatNotifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>

        <div className="space-y-3">
          <div className="card-dark p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="h-5 w-5 text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <h3 className="text-white font-medium">Dark Mode</h3>
                <p className="text-gray-400 text-sm">Use dark theme</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange("darkMode", !settings.darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? "bg-red-600" : "bg-gray-600"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="card-dark p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <h3 className="text-white font-medium">Language</h3>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Afrikaans">Afrikaans</option>
              <option value="Zulu">Zulu</option>
              <option value="Xhosa">Xhosa</option>
              <option value="Sotho">Sotho</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
