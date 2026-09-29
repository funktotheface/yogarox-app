export interface DeletionStatus {
  status: "none" | "requested" | string;
  request_id: number | null;
  due_at: string | null;
  processing_days: number;
  mode: string;
}

export interface YogaRoxUser {
  id: number;
  email: string;
  display_name?: string;
  first_name: string;
  last_name: string;
  roles: string[];
  deletion?: DeletionStatus;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  expires_at: string;
  user: YogaRoxUser;
}

export interface MeResponse {
  user: YogaRoxUser;
  expires_at?: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

export interface SubscriptionSummary {
  id: number;
  status: string;
  product_ids: number[];
  grants_access: boolean;
  next_payment: string | null;
  end_date: string | null;
}

export interface Membership {
  member: boolean;
  active: boolean;
  has_access: boolean;
  access_reason: string;
  qualifying_subscriptions: SubscriptionSummary[];
  subscriptions: SubscriptionSummary[];
}

export interface RegistrationConfig {
  enabled: boolean;
  terms_url: string;
  privacy_url: string;
  policy_version: string;
  code_length: number;
  code_expires_in: number;
  resend_after: number;
  password_min_bytes: number;
  password_max_bytes: number;
}

export interface RegisterRequestResponse {
  status: "verification_required";
  code_expires_in: number;
  resend_after: number;
  message: string;
}

export interface RegisterVerifyInput {
  email: string;
  code: string;
  password: string;
  first_name?: string;
  last_name?: string;
  accept_terms: true;
  policy_version: string;
}

export interface RegisterVerifyResponse {
  status: "account_created";
  requires_login: boolean;
}

export interface HealthResponse {
  ok: boolean;
  plugin_version: string;
  woocommerce_active: boolean;
  subscriptions_active: boolean;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  data?: { status?: number };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export interface LoginInput {
  login: string;
  password: string;
}

export const byteLength = (value: string) => new TextEncoder().encode(value).length;

export function validateNewPassword(value: string, min = 12, max = 128): string | null {
  if (!value) return "Please enter a password.";
  if (value !== value.trim()) return "Passwords can't start or end with a space.";
  const bytes = byteLength(value);
  if (bytes < min) return `Use at least ${min} characters.`;
  if (bytes > max) return "That password is too long.";
  return null;
}
