import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { validateApiKey, hasPermission } from "@/lib/api-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const requestId = params.id

    // Get service request from Firestore
    const docRef = doc(db, "serviceRequests", requestId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 })
    }

    const requestData = docSnap.data()

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    const response = {
      success: true,
      data: {
        id: requestId,
        ...requestData,
        createdAt: requestData.createdAt?.toDate().toISOString(),
        assignedAt: requestData.assignedAt?.toDate().toISOString(),
        completedAt: requestData.completedAt?.toDate().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching service request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate API key
    const { valid, apiKey, error } = await validateApiKey(request)

    if (!valid) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(apiKey!, "requests:update")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const requestId = params.id
    const body = await request.json()

    // Validate allowed fields for update
    const allowedFields = ["description", "contactPhone", "contactName", "vehicleInfo"]
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateData.updatedAt = Timestamp.now()

    // Update service request
    const docRef = doc(db, "serviceRequests", requestId)
    await updateDoc(docRef, updateData)

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    return NextResponse.json({
      success: true,
      message: "Service request updated successfully",
    })
  } catch (error) {
    console.error("Error updating service request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
