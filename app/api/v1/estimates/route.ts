import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, hasPermission } from "@/lib/api-auth"
import { updateDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const { valid, apiKey, error } = await validateApiKey(request)

    if (!valid) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(apiKey!, "estimates:create")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["serviceType", "location"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Calculate estimate based on service type and location
    const estimates = calculateServiceEstimate(body.serviceType, body.location, body.vehicleType)

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    return NextResponse.json({
      success: true,
      data: {
        serviceType: body.serviceType,
        estimates: estimates,
        currency: "MXN",
        validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        disclaimer: "Los precios son estimados y pueden variar según las condiciones específicas del servicio.",
      },
    })
  } catch (error) {
    console.error("Error calculating estimate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateServiceEstimate(serviceType: string, location: any, vehicleType?: string) {
  // Base prices in MXN
  const basePrices: { [key: string]: number } = {
    towing: 800,
    battery: 300,
    tire: 250,
    fuel: 200,
    lockout: 350,
    other: 400,
  }

  const basePrice = basePrices[serviceType] || basePrices.other

  // Distance multiplier (simplified)
  const distanceMultiplier = 1 + Math.random() * 0.3 // 0-30% increase based on distance

  // Time of day multiplier
  const hour = new Date().getHours()
  const timeMultiplier = hour >= 22 || hour <= 6 ? 1.5 : 1 // Night surcharge

  // Vehicle type multiplier
  const vehicleMultiplier = vehicleType === "truck" ? 1.3 : 1

  const estimatedPrice = Math.round(basePrice * distanceMultiplier * timeMultiplier * vehicleMultiplier)

  return {
    minimum: Math.round(estimatedPrice * 0.8),
    maximum: Math.round(estimatedPrice * 1.2),
    average: estimatedPrice,
    breakdown: {
      basePrice: basePrice,
      distanceFee: Math.round(basePrice * (distanceMultiplier - 1)),
      timeSurcharge: Math.round(basePrice * (timeMultiplier - 1)),
      vehicleSurcharge: Math.round(basePrice * (vehicleMultiplier - 1)),
    },
  }
}
