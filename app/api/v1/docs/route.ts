import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const documentation = {
    title: "Auxy API v1",
    version: "1.0.0",
    description: "API pública para solicitar servicios de auxilio vehicular",
    baseUrl: `${request.nextUrl.origin}/api/v1`,
    authentication: {
      type: "API Key",
      methods: ["Header: Authorization: Bearer YOUR_API_KEY", "Header: x-api-key: YOUR_API_KEY"],
    },
    endpoints: {
      "POST /requests": {
        description: "Crear una nueva solicitud de auxilio",
        permissions: ["requests:create"],
        parameters: {
          clientId: { type: "string", required: true, description: "ID del cliente" },
          type: { type: "string", required: true, enum: ["towing", "battery", "tire", "fuel", "lockout", "other"] },
          description: { type: "string", required: true, description: "Descripción del problema" },
          location: {
            type: "object",
            required: true,
            properties: {
              lat: { type: "number", description: "Latitud" },
              lng: { type: "number", description: "Longitud" },
              address: { type: "string", description: "Dirección legible" },
            },
          },
          contactPhone: { type: "string", required: false },
          contactName: { type: "string", required: false },
          vehicleInfo: { type: "string", required: false },
          priority: { type: "string", enum: ["low", "normal", "high"], default: "normal" },
        },
        response: {
          success: true,
          data: {
            requestId: "string",
            status: "pending",
            createdAt: "ISO 8601 date",
            estimatedResponseTime: "string",
          },
        },
      },
      "GET /requests": {
        description: "Obtener solicitudes de un cliente",
        permissions: ["requests:read"],
        parameters: {
          clientId: { type: "string", required: true },
          status: { type: "string", required: false },
          limit: { type: "number", default: 10 },
        },
      },
      "GET /requests/{id}": {
        description: "Obtener detalles de una solicitud específica",
        permissions: ["requests:read"],
      },
      "PATCH /requests/{id}": {
        description: "Actualizar una solicitud",
        permissions: ["requests:update"],
        parameters: {
          description: { type: "string" },
          contactPhone: { type: "string" },
          contactName: { type: "string" },
          vehicleInfo: { type: "string" },
        },
      },
      "POST /requests/{id}/cancel": {
        description: "Cancelar una solicitud",
        permissions: ["requests:cancel"],
        parameters: {
          reason: { type: "string", required: false },
        },
      },
      "GET /providers": {
        description: "Buscar proveedores disponibles en una zona",
        permissions: ["providers:read"],
        parameters: {
          lat: { type: "number", required: true },
          lng: { type: "number", required: true },
          radius: { type: "number", default: 10, description: "Radio en kilómetros" },
          serviceType: { type: "string", required: false },
        },
      },
      "POST /estimates": {
        description: "Obtener estimación de precio para un servicio",
        permissions: ["estimates:create"],
        parameters: {
          serviceType: { type: "string", required: true },
          location: { type: "object", required: true },
          vehicleType: { type: "string", required: false },
        },
      },
    },
    rateLimits: {
      default: "100 requests per hour per API key",
      burst: "10 requests per minute",
    },
    errors: {
      400: "Bad Request - Invalid parameters",
      401: "Unauthorized - Invalid or missing API key",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource not found",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error",
    },
    examples: {
      createRequest: {
        curl: `curl -X POST ${request.nextUrl.origin}/api/v1/requests \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clientId": "client_123",
    "type": "towing",
    "description": "Mi auto no enciende y necesito remolque",
    "location": {
      "lat": 19.4326,
      "lng": -99.1332,
      "address": "Ciudad de México, CDMX"
    },
    "contactPhone": "+52 55 1234 5678",
    "contactName": "Juan Pérez"
  }'`,
      },
    },
  }

  return NextResponse.json(documentation, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
