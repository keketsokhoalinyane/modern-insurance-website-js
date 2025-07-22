"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, ArrowRight } from "lucide-react"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    bio: "",
    photos: [] as string[],
    preferences: {
      ageRange: [18, 50] as [number, number],
      gender: "both",
      distance: 50,
    },
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        localStorage.setItem("user", JSON.stringify(updatedUser))
        router.push("/app")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card-dark p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-gray-400">Step {step} of 3 - Let's make you irresistible</p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Add Photos</h2>
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-red-600 transition-colors cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 text-center">Add at least 2 photos to continue</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">About You</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none h-32 resize-none"
                  placeholder="Tell people about yourself..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Your Preferences</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Range: {formData.preferences.ageRange[0]} - {formData.preferences.ageRange[1]}
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.preferences.ageRange[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ageRange: [Number.parseInt(e.target.value), formData.preferences.ageRange[1]],
                        },
                      })
                    }
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.preferences.ageRange[1]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ageRange: [formData.preferences.ageRange[0], Number.parseInt(e.target.value)],
                        },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interested In</label>
                <select
                  value={formData.preferences.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, gender: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                  <option value="both">Everyone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Distance: {formData.preferences.distance}km
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.preferences.distance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, distance: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 border border-gray-600 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={step === 3 ? handleComplete : () => setStep(step + 1)}
              className="flex-1 gradient-red py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {step === 3 ? "Complete Setup" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
