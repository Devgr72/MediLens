/**
 * MediLens AI — Frontend Auth API
 * All backend authentication requests are routed through this file.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ── Response Types ─────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  auth_provider: string
  is_verified: boolean
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export interface MessageResponse {
  message: string
  user?: AuthUser
}

export interface ApiError {
  detail: string
}

// ── Helper ─────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  method: string,
  body?: object
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    const err = data as ApiError
    throw new Error(err.detail || "Something went wrong. Please try again.")
  }

  return data as T
}

// ── Auth Endpoints ─────────────────────────────────────────

/**
 * Login with email + password.
 * Returns a JWT token and user info.
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/login", "POST", { email, password })
}

/**
 * Create a new account.
 * An OTP is sent to the provided email.
 */
export async function signup(name: string, email: string, password: string): Promise<MessageResponse> {
  return request<MessageResponse>("/api/v1/auth/signup", "POST", { name, email, password })
}

/**
 * Verify OTP sent to email.
 */
export async function verifyOTP(email: string, otp: string): Promise<MessageResponse> {
  return request<MessageResponse>("/api/v1/auth/verify-otp", "POST", { email, otp })
}

/**
 * Resend OTP to email.
 */
export async function resendOTP(email: string): Promise<MessageResponse> {
  return request<MessageResponse>("/api/v1/auth/resend-otp", "POST", { email })
}

/**
 * Login / register with Google ID token from Google Identity Services.
 * Returns a JWT token and user info.
 */
export async function googleLogin(id_token: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/google-login", "POST", { id_token })
}
