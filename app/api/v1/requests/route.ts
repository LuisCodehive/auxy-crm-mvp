import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore"
import { validateApiKey, hasPermission } from "@/lib/api-auth"
import { notifyServiceRequest } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const { valid, apiKey, error } = await validateApiKey(request)

    if (!valid) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(apiKey!, "requests:create")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["clientId", "type", "description", "location"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Validate service type
    const validTypes = ["towing", "battery", "tire", "fuel", "lockout", "other"]
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid service type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate location
    if (!body.location.lat || !body.location.lng || !body.location.address) {
      return NextResponse.json({ error: "Location must include lat, lng, and address" }, { status: 400 })
    }

    // Create service request
    const serviceRequest = {
      clientId: body.clientId,
      type: body.type,
      description: body.description,
      location: {
        lat: Number.parseFloat(body.location.lat),
        lng: Number.parseFloat(body.location.lng),
        address: body.location.address,
      },
      status: "pending",
      createdAt: Timestamp.now(),
      estimatedPrice: body.estimatedPrice || null,
      priority: body.priority || "normal",
      contactPhone: body.contactPhone || null,
      contactName: body.contactName || null,
      vehicleInfo: body.vehicleInfo || null,
    }

    const docRef = await addDoc(collection(db, "serviceRequests"), serviceRequest)

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    // Send notification
    try {
      await notifyServiceRequest(body.clientId, docRef.id, body.type)
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError)
      // Don't fail the request if notification fails
    }

    const response = {
      success: true,
      data: {
        requestId: docRef.id,
        status: "pending",
        createdAt: serviceRequest.createdAt.toDate().toISOString(),
        estimatedResponseTime: "15-30 minutes",
      },
      message: "Service request created successfully",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating service request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const { valid, apiKey, error } = await validateApiKey(request)

    if (!valid) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(apiKey!, "requests:read")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!clientId) {
      return NextResponse.json({ error: "clientId parameter is required" }, { status: 400 })
    }

    // This would normally query Firestore, but for brevity we'll return a mock response
    const mockRequests = [
      {
        id: "req_123",
        clientId: clientId,
        type: "towing",
        status: "pending",
        createdAt: new Date().toISOString(),
        location: {
          lat: 19.4326,
          lng: -99.1332,
          address: "Ciudad de México, CDMX",
        },
      },
    ]

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    return NextResponse.json({
      success: true,
      data: mockRequests,
      pagination: {
        total: mockRequests.length,
        limit: limit,
        offset: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching service requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
