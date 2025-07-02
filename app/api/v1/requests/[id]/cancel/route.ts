import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { validateApiKey, hasPermission } from "@/lib/api-auth"
import { createNotification } from "@/lib/notification-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate API key
    const { valid, apiKey, error } = await validateApiKey(request)

    if (!valid) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(apiKey!, "requests:cancel")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const requestId = params.id
    const body = await request.json()

    // Get current request status
    const docRef = doc(db, "serviceRequests", requestId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 })
    }

    const requestData = docSnap.data()

    // Check if request can be cancelled
    if (requestData.status === "completed") {
      return NextResponse.json({ error: "Cannot cancel a completed request" }, { status: 400 })
    }

    if (requestData.status === "cancelled") {
      return NextResponse.json({ error: "Request is already cancelled" }, { status: 400 })
    }

    // Update request status
    await updateDoc(docRef, {
      status: "cancelled",
      cancelledAt: Timestamp.now(),
      cancellationReason: body.reason || "Cancelled by client",
      updatedAt: Timestamp.now(),
    })

    // Notify provider if assigned
    if (requestData.providerId) {
      try {
        await createNotification({
          userId: requestData.providerId,
          title: "Solicitud cancelada",
          message: `La solicitud de servicio ${requestId} ha sido cancelada por el cliente.`,
          type: "warning",
          data: { requestId },
        })
      } catch (notificationError) {
        console.error("Error sending cancellation notification:", notificationError)
      }
    }

    // Update API key usage
    await updateDoc(doc(db, "apiKeys", apiKey!.id), {
      lastUsed: Timestamp.now(),
      usageCount: (apiKey!.usageCount || 0) + 1,
    })

    return NextResponse.json({
      success: true,
      message: "Service request cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling service request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
