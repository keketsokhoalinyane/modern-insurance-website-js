import { robustFetch, isOnline } from "./network"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if online first
    if (!isOnline()) {
      throw new Error("No internet connection. Please check your network settings.")
    }

    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await robustFetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      // Handle different content types
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Request failed with status ${response.status}`)
        }

        return data
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      return response as unknown as T
    } catch (error) {
      // Enhanced error handling for mobile networks
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error("Connection failed. Please check your mobile data or WiFi connection.")
        }

        if (error.message.includes("timeout")) {
          throw new Error("Request timed out. This might be due to slow network. Please try again.")
        }

        if (error.message.includes("Network request failed")) {
          throw new Error("Network error. Please check your connection and try again.")
        }
      }

      throw error
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }
}

export const apiClient = new ApiClient("/api")
