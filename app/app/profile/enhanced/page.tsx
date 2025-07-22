"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Edit, Settings, LogOut, Crown, Upload, Video, ImageIcon } from "lucide-react"

export default function EnhancedProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bio: "",
    hobbies: [] as string[],
    firstImpression: "",
    backgroundImage: "",
  })
  const [newHobby, setNewHobby] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({
        name: parsedUser.name,
        age: parsedUser.age.toString(),
        bio: parsedUser.bio,
        hobbies: parsedUser.hobbies || [],
        firstImpression: parsedUser.firstImpression || "",
        backgroundImage: parsedUser.backgroundImage || "",
      })
    }
  }, [])

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: Number.parseInt(formData.age),
          bio: formData.bio,
          hobbies: formData.hobbies,
          firstImpression: formData.firstImpression,
          backgroundImage: formData.backgroundImage,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setEditing(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const addHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData({
        ...formData,
        hobbies: [...formData.hobbies, newHobby.trim()],
      })
      setNewHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    setFormData({
      ...formData,
      hobbies: formData.hobbies.filter((h) => h !== hobby),
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return "Active now"
    if (minutes < 60) return `Active ${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Active ${hours}h ago`
    const days = Math.floor(hours / 24)
    return `Active ${days}d ago`
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
      {/* Background Image */}
      <div
        className="relative h-32 rounded-2xl overflow-hidden mb-4"
        style={{
          backgroundImage: user.backgroundImage
            ? `url(${user.backgroundImage})`
            : "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        {editing && (
          <button className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
            <Camera className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="text-center mb-8 -mt-16 relative z-10">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden mx-auto mb-4 border-4 border-black">
            {user.photos.length > 0 ? (
              <img src={user.photos[0] || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-gray-400 font-bold">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <button className="absolute bottom-4 right-0 bg-red-600 p-2 rounded-full">
            <Camera className="h-4 w-4 text-white" />
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
              placeholder="Your name"
            />
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
              placeholder="Your age"
            />
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none h-24 resize-none"
              placeholder="Tell us about yourself..."
            />
            <textarea
              value={formData.firstImpression}
              onChange={(e) => setFormData({ ...formData, firstImpression: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none h-20 resize-none"
              placeholder="What's your first impression like?"
            />

            {/* Hobbies Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hobbies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  placeholder="Add a hobby"
                  onKeyPress={(e) => e.key === "Enter" && addHobby()}
                />
                <button
                  type="button"
                  onClick={addHobby}
                  className="gradient-red px-4 py-2 rounded-lg text-white font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {hobby}
                    <button onClick={() => removeHobby(hobby)} className="text-red-400 hover:text-red-300">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 gradient-red py-2 rounded-lg text-white font-semibold">
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-600 py-2 rounded-lg text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {user.name}, {user.age}
              </h1>
              {user.isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
            </div>
            <p className="text-gray-400 mb-2">{user.location}</p>
            <p className="text-green-400 text-sm mb-4">{formatLastSeen(user.lastSeen)}</p>
            <p className="text-gray-300 mb-2">{user.bio || "No bio yet"}</p>
            {user.firstImpression && <p className="text-red-300 text-sm mb-4 italic">"{user.firstImpression}"</p>}

            {/* Hobbies Display */}
            {user.hobbies && user.hobbies.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {user.hobbies.map((hobby: string, index: number) => (
                    <span key={index} className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 mx-auto text-red-400 hover:text-red-300"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Media Upload Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">My Media</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Photos */}
          {user.photos.map((photo: string, index: number) => (
            <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={photo || "/placeholder.svg"}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Videos */}
          {user.videos &&
            user.videos.map((video: string, index: number) => (
              <div key={`video-${index}`} className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative">
                <video src={video} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
            ))}

          {/* Upload buttons */}
          <button className="aspect-square bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-600 transition-colors flex flex-col items-center justify-center">
            <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">Add Photo</span>
          </button>

          <button className="aspect-square bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-600 transition-colors flex flex-col items-center justify-center">
            <Video className="h-6 w-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">Add Video</span>
          </button>

          <button className="aspect-square bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-600 transition-colors flex flex-col items-center justify-center">
            <Upload className="h-6 w-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">Add GIF</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          {user.isPremium ? "Unlimited uploads" : `${user.imageUploadCount || 0} uploads remaining`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-dark p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Matches</div>
        </div>
        <div className="card-dark p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white mb-1">{user.isPremium ? "∞" : user.messageCount}</div>
          <div className="text-sm text-gray-400">Messages</div>
        </div>
        <div className="card-dark p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Likes</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {!user.isPremium && (
          <button
            onClick={() => router.push("/app/subscription")}
            className="w-full card-dark p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-white font-semibold">Upgrade to Premium</span>
            </div>
            <div className="text-yellow-500 text-sm font-semibold">Get Unlimited Messages</div>
          </button>
        )}

        <button
          onClick={() => router.push("/app/settings")}
          className="w-full card-dark p-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-400" />
          <span className="text-white">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full card-dark p-4 rounded-xl flex items-center gap-3 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          <span className="text-red-400">Log Out</span>
        </button>
      </div>
    </div>
  )
}
