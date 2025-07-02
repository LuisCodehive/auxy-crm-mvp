import { db } from "@/lib/firebase"
import { getMessagingInstance } from "@/lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore"
import { getToken, onMessage } from "firebase/messaging"
import type { Notification } from "@/types"

// Función para crear una nueva notificación
export async function createNotification(notification: Omit<Notification, "id" | "createdAt">) {
  try {
    const notificationData = {
      ...notification,
      createdAt: Timestamp.now(),
      read: false,
    }

    const docRef = await addDoc(collection(db, "notifications"), notificationData)
    return { id: docRef.id, ...notificationData }
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Función para obtener notificaciones de un usuario
export async function getUserNotifications(userId: string) {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[]
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

// Función para marcar una notificación como leída
export async function markNotificationAsRead(notificationId: string) {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    })
    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Función para marcar todas las notificaciones de un usuario como leídas
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))

    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Función para eliminar una notificación
export async function deleteNotification(notificationId: string) {
  try {
    await deleteDoc(doc(db, "notifications", notificationId))
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

// Función para eliminar todas las notificaciones de un usuario
export async function deleteAllNotifications(userId: string) {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error("Error deleting all notifications:", error)
    throw error
  }
}

// Función para enviar notificaciones push
export async function sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
  try {
    // Primero guardamos la notificación en Firestore
    await createNotification({
      userId,
      title,
      message: body,
      type: data.type || "info",
      read: false,
      data,
    })

    // Luego intentamos enviar la notificación push si el usuario tiene un token
    const userTokensQuery = query(collection(db, "userTokens"), where("userId", "==", userId))

    const tokenSnapshot = await getDocs(userTokensQuery)

    if (tokenSnapshot.empty) {
      console.log("No tokens found for user:", userId)
      return false
    }

    // Aquí normalmente enviaríamos la notificación a través de Firebase Cloud Functions
    // o un servidor backend, pero para este ejemplo solo registramos la intención
    console.log(`Push notification would be sent to user ${userId} with title: ${title}`)

    return true
  } catch (error) {
    console.error("Error sending push notification:", error)
    throw error
  }
}

// Función para registrar el token de FCM para notificaciones push
export async function registerPushNotificationToken(userId: string) {
  try {
    const messaging = await getMessagingInstance()

    if (!messaging) {
      console.log("Firebase messaging is not supported in this browser")
      return false
    }

    // Solicitar permiso para notificaciones
    const permission = await Notification.requestPermission()

    if (permission !== "granted") {
      console.log("Notification permission not granted")
      return false
    }

    // Obtener token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    if (!token) {
      console.log("No registration token available")
      return false
    }

    // Guardar token en Firestore
    const tokensRef = collection(db, "userTokens")
    const q = query(tokensRef, where("token", "==", token))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      await addDoc(tokensRef, {
        userId,
        token,
        createdAt: Timestamp.now(),
      })
    }

    // Configurar listener para mensajes en primer plano
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload)
      // Aquí podríamos mostrar una notificación en la aplicación
    })

    return true
  } catch (error) {
    console.error("Error registering push notification token:", error)
    return false
  }
}

// Función para crear notificaciones específicas de eventos comunes
export async function notifyServiceRequest(clientId: string, requestId: string, requestType: string) {
  return createNotification({
    userId: clientId,
    title: "Solicitud de servicio creada",
    message: `Tu solicitud de ${requestType} ha sido creada y está pendiente de asignación.`,
    type: "request",
    data: { requestId },
  })
}

export async function notifyServiceAssigned(clientId: string, providerId: string, requestId: string) {
  // Notificar al cliente
  await createNotification({
    userId: clientId,
    title: "Servicio asignado",
    message: "Tu solicitud de servicio ha sido asignada a un proveedor.",
    type: "assignment",
    data: { requestId, providerId },
  })

  // Notificar al proveedor
  return createNotification({
    userId: providerId,
    title: "Nueva asignación de servicio",
    message: "Se te ha asignado una nueva solicitud de servicio.",
    type: "assignment",
    data: { requestId },
  })
}

export async function notifyServiceInProgress(clientId: string, providerId: string, requestId: string) {
  // Notificar al cliente
  return createNotification({
    userId: clientId,
    title: "Servicio en progreso",
    message: "Tu servicio está en camino.",
    type: "info",
    data: { requestId, providerId },
  })
}

export async function notifyServiceCompleted(clientId: string, providerId: string, requestId: string) {
  // Notificar al cliente
  await createNotification({
    userId: clientId,
    title: "Servicio completado",
    message: "Tu servicio ha sido completado. ¡Gracias por usar Auxy!",
    type: "completion",
    data: { requestId, providerId },
  })

  // Notificar al proveedor
  return createNotification({
    userId: providerId,
    title: "Servicio completado",
    message: "Has completado un servicio exitosamente.",
    type: "completion",
    data: { requestId },
  })
}

export async function notifyPaymentReceived(providerId: string, amount: number, requestId: string) {
  return createNotification({
    userId: providerId,
    title: "Pago recibido",
    message: `Has recibido un pago de $${amount.toFixed(2)} por tu servicio.`,
    type: "payment",
    data: { requestId, amount },
  })
}

export async function notifyAdminNewProvider(adminId: string, providerId: string, providerName: string) {
  return createNotification({
    userId: adminId,
    title: "Nuevo proveedor registrado",
    message: `${providerName} se ha registrado como proveedor y requiere aprobación.`,
    type: "info",
    data: { providerId },
  })
}
