import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { NextRequest } from "next/server"

export interface ApiKey {
  id: string
  key: string
  name: string
  isActive: boolean
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
  rateLimit: number
  usageCount: number
}

export async function validateApiKey(
  request: NextRequest,
): Promise<{ valid: boolean; apiKey?: ApiKey; error?: string }> {
  try {
    const authHeader = request.headers.get("authorization")
    const apiKeyHeader = request.headers.get("x-api-key")

    let apiKeyValue: string | null = null

    // Check for API key in Authorization header (Bearer token)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      apiKeyValue = authHeader.substring(7)
    }

    // Check for API key in x-api-key header
    if (!apiKeyValue && apiKeyHeader) {
      apiKeyValue = apiKeyHeader
    }

    if (!apiKeyValue) {
      return { valid: false, error: "API key is required" }
    }

    // Query Firestore for the API key
    const q = query(collection(db, "apiKeys"), where("key", "==", apiKeyValue), where("isActive", "==", true))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return { valid: false, error: "Invalid API key" }
    }

    const apiKeyDoc = querySnapshot.docs[0]
    const apiKey = {
      id: apiKeyDoc.id,
      ...apiKeyDoc.data(),
      createdAt: apiKeyDoc.data().createdAt?.toDate(),
      lastUsed: apiKeyDoc.data().lastUsed?.toDate(),
    } as ApiKey

    // Check rate limiting (simple implementation)
    const now = new Date()
    const oneHour = 60 * 60 * 1000
    const hourAgo = new Date(now.getTime() - oneHour)

    if (apiKey.lastUsed && apiKey.usageCount >= apiKey.rateLimit && apiKey.lastUsed > hourAgo) {
      return { valid: false, error: "Rate limit exceeded" }
    }

    return { valid: true, apiKey }
  } catch (error) {
    console.error("Error validating API key:", error)
    return { valid: false, error: "Internal server error" }
  }
}

export function hasPermission(apiKey: ApiKey, permission: string): boolean {
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes("*")
}
