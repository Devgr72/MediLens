/**
 * MediLens AI — Frontend Auth API
 * All backend authentication requests are routed through this file.
 * Real backend endpoints are used; demo fallback preserved for offline use.
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

// ── Helpers ────────────────────────────────────────────────

/** POST to backend and throw a user-friendly error if not ok. */
async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      typeof err.detail === "string"
        ? err.detail
        : Array.isArray(err.detail)
          ? err.detail.map((e: { msg: string }) => e.msg).join(", ")
          : "Something went wrong. Please try again.";
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── Auth Endpoints ─────────────────────────────────────────

/**
 * Login with email + password — calls real backend.
 * Demo fallback kept for Prabhjot offline use only.
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  // Hardcoded demo fallback — no real backend account
  if (email === "prabhjotwork2004@gmail.com" && password === "pajji@123") {
    return {
      access_token: "mock-jwt-token-demo",
      token_type: "bearer",
      user: {
        id: "prabhjot-demo",
        name: "Prabhjot Singh",
        email,
        auth_provider: "email",
        is_verified: true,
        created_at: new Date().toISOString(),
      },
    };
  }

  // Real backend call — returns a genuine JWT
  const data = await apiPost<{ access_token: string; token_type: string }>(
    "/api/v1/users/login",
    { email, password }
  );

  // Decode display name from token subject
  let userName = email.split("@")[0];
  try {
    const payload = JSON.parse(atob(data.access_token.split(".")[1]));
    if (payload.sub) userName = payload.sub.split("@")[0];
  } catch (_) {
    /* ignore decode errors */
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
    user: {
      id: email,
      name: userName,
      email,
      auth_provider: "email",
      is_verified: true,
      created_at: new Date().toISOString(),
    },
  };
}

/**
 * Create a new account — calls real backend.
 */
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<MessageResponse> {
  return apiPost<MessageResponse>("/api/v1/auth/signup", {
    name,
    email,
    password,
  });
}

/**
 * Verify OTP sent to email — calls real backend.
 */
export async function verifyOTP(
  email: string,
  otp: string
): Promise<MessageResponse> {
  return apiPost<MessageResponse>("/api/v1/auth/verify-otp", { email, otp });
}

/**
 * Resend OTP to email — calls real backend.
 */
export async function resendOTP(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>("/api/v1/auth/resend-otp", { email });
}

/**
 * Login / register with Google ID token — calls real backend.
 */
export async function googleLogin(id_token: string): Promise<AuthResponse> {
  const data = await apiPost<{ access_token: string; token_type: string }>(
    "/api/v1/auth/google-login",
    { id_token }
  );

  // Extract user info from the Google ID token for display
  let userData = { name: "Google User", email: "google@example.com" };
  try {
    const base64Url = id_token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    userData = {
      name: parsed.name || userData.name,
      email: parsed.email || userData.email,
    };
  } catch (_) {
    /* ignore */
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
    user: {
      id: "google-" + userData.email,
      name: userData.name,
      email: userData.email,
      auth_provider: "google",
      is_verified: true,
      created_at: new Date().toISOString(),
    },
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

/**
 * Request a password reset OTP.
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>("/api/v1/users/forgot-password", { email });
}

/**
 * Reset password using OTP.
 */
export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<MessageResponse> {
  return apiPost<MessageResponse>("/api/v1/users/reset-password", payload);
}
