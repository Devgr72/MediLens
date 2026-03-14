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
// ── Mock Helper ───────────────────────────────────────────
const MOCK_DELAY = 800;
const STORAGE_KEY = "medilens_mock_users";

function getMockUsers(): any[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveMockUser(user: any) {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Auth Endpoints (Mocked) ────────────────────────────────

/**
 * Login with email + password. (Mocked)
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  await delay(MOCK_DELAY);
  
  // 1. Check normal mock users
  const users = getMockUsers();
  let user = users.find(u => u.email === email && u.password === password);

  // 2. HARDCODED DEMO FALLBACK for Prabhjot (Unblock immediately)
  if (!user && email === "prabhjotwork2004@gmail.com" && password === "pajji@123") {
    user = {
      id: "prabhjot-demo",
      name: "Prabhjot Singh",
      email: "prabhjotwork2004@gmail.com",
      auth_provider: "email",
      is_verified: true,
      created_at: new Date().toISOString()
    };
  }

  if (!user && email !== "demo@medilens.ai") {
    throw new Error("Invalid email or password. (Mock Mode)");
  }

  const finalUser = user || {
    id: "demo-user",
    name: "Demo User",
    email: "demo@medilens.ai",
    auth_provider: "email",
    is_verified: true,
    created_at: new Date().toISOString()
  };

  return {
    access_token: "mock-jwt-token-" + Math.random().toString(36).substring(7),
    token_type: "bearer",
    user: finalUser
  };
}

/**
 * Create a new account. (Mocked)
 */
export async function signup(name: string, email: string, password: string): Promise<MessageResponse> {
  await delay(MOCK_DELAY);
  const users = getMockUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("Email already exists. (Mock Mode)");
  }

  saveMockUser({
    id: Math.random().toString(36).substring(7),
    name,
    email,
    password,
    auth_provider: "email",
    is_verified: false,
    created_at: new Date().toISOString()
  });

  return { message: "Mock OTP sent to " + email };
}

/**
 * Verify OTP sent to email. (Mocked)
 */
export async function verifyOTP(email: string, otp: string): Promise<MessageResponse> {
  await delay(MOCK_DELAY);
  const users = getMockUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) throw new Error("User not found.");
  
  users[userIndex].is_verified = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

  return { message: "Account verified successfully!", user: users[userIndex] };
}

/**
 * Resend OTP to email. (Mocked)
 */
export async function resendOTP(email: string): Promise<MessageResponse> {
  await delay(MOCK_DELAY);
  return { message: "New mock OTP sent to " + email };
}

/**
 * Login / register with Google ID token. (Mocked but decodes real data)
 */
export async function googleLogin(id_token: string): Promise<AuthResponse> {
  await delay(MOCK_DELAY);
  
  // Basic JWT decoding to get real user data from Google
  let userData = {
    name: "Google User",
    email: "google@example.com",
    picture: ""
  };

  try {
    const base64Url = id_token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    userData = {
      name: payload.name || "Google User",
      email: payload.email || "google@example.com",
      picture: payload.picture || ""
    };
  } catch (e) {
    console.error("Failed to decode Google ID Token", e);
  }

  return {
    access_token: "mock-google-token-" + Math.random().toString(36).substring(7),
    token_type: "bearer",
    user: {
      id: "google-" + Math.random().toString(36).substring(7),
      name: userData.name,
      email: userData.email,
      auth_provider: "google",
      is_verified: true,
      created_at: new Date().toISOString()
    }
  };
}

/**
 * Request a password reset OTP. (Mocked)
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  await delay(MOCK_DELAY);
  return { message: "Reset OTP sent to " + email };
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  new_password: string
}

/**
 * Reset password using OTP. (Mocked)
 */
export async function resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
  await delay(MOCK_DELAY);
  const users = getMockUsers();
  const userIndex = users.findIndex(u => u.email === payload.email);
  if (userIndex !== -1) {
    users[userIndex].password = payload.new_password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
  return { message: "Password reset successful! (Mock Mode)" };
}
