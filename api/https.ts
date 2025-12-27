const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function http<T>(
endpoint: string,
options?: RequestInit
): Promise<T> {
const res = await fetch(`${API_URL}${endpoint}`, {
headers: {
    "Content-Type": "application/json",
    ...(options?.headers || {})
},
    ...options
})

if (!res.ok) {
    const error = await res.text()
    throw new Error(error || "API Error")
}

return res.json() as Promise<T>
}
