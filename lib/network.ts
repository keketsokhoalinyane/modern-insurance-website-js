// Network utility for handling all mobile networks and WiFi connections
export interface NetworkConfig {
  timeout: number
  retries: number
  retryDelay: number
}

export const NETWORK_CONFIGS = {
  // Optimized for slow mobile networks (2G, 3G)
  slow: {
    timeout: 30000, // 30 seconds
    retries: 5,
    retryDelay: 2000, // 2 seconds
  },
  // Standard for 4G/WiFi
  standard: {
    timeout: 15000, // 15 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },
  // Fast for 5G/good WiFi
  fast: {
    timeout: 8000, // 8 seconds
    retries: 2,
    retryDelay: 500, // 0.5 seconds
  },
}

// Detect network speed and return appropriate config
export const getNetworkConfig = (): NetworkConfig => {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection

    if (connection) {
      const effectiveType = connection.effectiveType

      switch (effectiveType) {
        case "slow-2g":
        case "2g":
          return NETWORK_CONFIGS.slow
        case "3g":
          return NETWORK_CONFIGS.slow
        case "4g":
          return NETWORK_CONFIGS.standard
        default:
          return NETWORK_CONFIGS.standard
      }
    }
  }

  // Default to standard config
  return NETWORK_CONFIGS.standard
}

// Enhanced fetch with retry logic for mobile networks
export const robustFetch = async (
  url: string,
  options: RequestInit = {},
  customConfig?: Partial<NetworkConfig>,
): Promise<Response> => {
  const config = { ...getNetworkConfig(), ...customConfig }

  // Add default headers for mobile compatibility
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "User-Agent": navigator.userAgent || "TembiChat-Mobile",
    ...options.headers,
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: defaultHeaders,
    // Add credentials for cross-origin requests
    credentials: "same-origin",
    // Set mode to handle CORS properly
    mode: "cors",
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response is ok
      if (response.ok) {
        return response
      }

      // Handle specific HTTP errors
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`)
      }

      if (response.status === 429) {
        // Rate limited, wait longer before retry
        await sleep(config.retryDelay * 2)
        continue
      }

      // For client errors (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      lastError = error as Error

      // Don't retry on abort (user cancelled)
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }

      // Don't retry on network errors that indicate no connection
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // Check if we're offline
        if (!navigator.onLine) {
          throw new Error("No internet connection. Please check your network and try again.")
        }
      }

      // If this is the last attempt, throw the error
      if (attempt === config.retries) {
        break
      }

      // Wait before retrying with exponential backoff
      const delay = config.retryDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }

  // If we get here, all retries failed
  throw new Error(lastError?.message || "Network request failed after multiple attempts. Please check your connection.")
}

// Sleep utility
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Check if user is online
export const isOnline = (): boolean => {
  return navigator.onLine
}

// Network status monitoring
export const onNetworkChange = (callback: (online: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

// Get connection info for debugging
export const getConnectionInfo = () => {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection?.effectiveType || "unknown",
      downlink: connection?.downlink || "unknown",
      rtt: connection?.rtt || "unknown",
      saveData: connection?.saveData || false,
    }
  }
  return null
}
