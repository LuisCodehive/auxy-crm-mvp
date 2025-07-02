import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore"
import { validateApiKey, hasPermission } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const { valid, apiKey, error } = await validateApiKey(request)

    if (!valid) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(apiKey!, "providers:read")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "10") // km
    const serviceType = searchParams.get("serviceType")

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng parameters are required" }, { status: 400 })
    }

    // Query approved providers
    const q = query(collection(db, "users"), where("role", "==", "provider"), where("isApproved", "==", true))

    const querySnapshot = await getDocs(q)
    const providers = []

    for (const doc of querySnapshot.docs) {
      const providerData = doc.data()

      // Calculate distance (simplified - in production use proper geospatial queries)
      const providerLat = providerData.location?.lat || 0
      const providerLng = providerData.location?.lng || 0

      const distance = calculateDistance(lat, lng, providerLat, providerLng)

      if (distance <= radius) {
        providers.push({
          id: doc.id,
          name: providerData.name,
          companyName: providerData.companyName,
          rating: providerData.rating || 0,
          totalServices: providerData.totalServices || 0,
          distance: Math.round(distance * 100) / 100,
          serviceTypes: providerData.serviceTypes || ["towing", "battery", "tire", "fuel", "lockout"],
          estimatedArrival: Math.ceil(distance * 3), // rough estimate: 3 minutes per km
          isAvailable: providerData.isAvailable !== false,
        })
      }
    }

    // Sort by distance and rating
    providers.sort((a, b) => {
      const scoreA = 5 - a.distance + a.rating
      const scoreB = 5 - b.distance + b.rating
      return scoreB - scoreA
    })

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    return NextResponse.json({
      success: true,
      data: providers,
      meta: {
        searchLocation: { lat, lng },
        radius: radius,
        totalFound: providers.length,
      },
    })
  } catch (error) {
    console.error("Error fetching providers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
