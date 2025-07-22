"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { isOnline, onNetworkChange, getConnectionInfo } from "@/lib/network"

export default function NetworkStatus() {
  const [online, setOnline] = useState(true)
  const [connectionInfo, setConnectionInfo] = useState<any>(null)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Initial status
    setOnline(isOnline())
    setConnectionInfo(getConnectionInfo())

    // Listen for network changes
    const cleanup = onNetworkChange((isOnline) => {
      setOnline(isOnline)
      setShowStatus(true)

      // Hide status after 3 seconds if back online
      if (isOnline) {
        setTimeout(() => setShowStatus(false), 3000)
      }
    })

    return cleanup
  }, [])

  // Always show if offline
  if (!online || showStatus) {
    return (
      <div className={`fixed top-20 left-4 right-4 z-50 mx-auto max-w-md`}>
        <div
          className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${
            online
              ? "bg-green-900/90 text-green-300 border border-green-600"
              : "bg-red-900/90 text-red-300 border border-red-600"
          }`}
        >
          {online ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Connection restored</span>
              {connectionInfo?.effectiveType && (
                <span className="text-xs opacity-75">({connectionInfo.effectiveType})</span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>No internet connection</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}
