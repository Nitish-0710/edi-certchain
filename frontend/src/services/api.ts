/**
 * API Service Layer
 * ------------------
 * Centralized API client for communicating with the backend.
 * Uses fetch API with JWT token auto-attachment.
 */

const API_BASE = "http://localhost:5000/api";

// ========================
// Helper: Make authenticated requests
// ========================

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem("certchain_token");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON requests (not for FormData)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// ========================
// Auth API
// ========================

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  role: "student" | "issuer" | "verifier";
  institution?: string;
}) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(credentials: {
  email: string;
  password: string;
  role?: string;
}) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getMe() {
  return apiRequest("/auth/me");
}

export async function updateWalletAddress(walletAddress: string) {
  return apiRequest("/auth/wallet", {
    method: "PUT",
    body: JSON.stringify({ walletAddress }),
  });
}

// ========================
// Credential API
// ========================

export async function uploadCredential(formData: FormData) {
  const token = localStorage.getItem("certchain_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/uploadCredential`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data;
}

export async function verifyCredential(hash: string) {
  return apiRequest(`/verifyCredential/${hash}`);
}

export async function getStudentCredentials(studentAddress: string) {
  return apiRequest(`/credentials/${studentAddress}`);
}

export async function revokeCredential(credentialHash: string) {
  return apiRequest("/revokeCredential", {
    method: "POST",
    body: JSON.stringify({ credentialHash }),
  });
}

// ========================
// Health Check
// ========================

export async function healthCheck() {
  return apiRequest("/health");
}

// ========================
// Types
// ========================

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "issuer" | "verifier";
  walletAddress: string | null;
  institution: string;
}

export interface CredentialData {
  credentialHash: string;
  studentAddress: string;
  issuerAddress: string;
  ipfsCid: string;
  fileName: string;
  metadata: {
    title: string;
    description: string;
    credentialType: string;
    institution: string;
  };
  isValid: boolean;
  txHash: string;
  issuedAt: string;
}
