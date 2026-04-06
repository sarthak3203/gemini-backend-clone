const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest(path, { method = "GET", data, token, headers } = {}) {
  const nextHeaders = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: nextHeaders,
    body: data ? JSON.stringify(data) : undefined,
  });

  const payload = await parseJsonSafe(res);
  if (!res.ok) {
    const msg =
      payload?.error ||
      payload?.message ||
      (res.status === 401 ? "Session expired. Please sign in again." : "Request failed.");
    throw new ApiError(msg, { status: res.status, payload });
  }
  return payload;
}

