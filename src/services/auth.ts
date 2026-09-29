import { apiRequest } from "@/services/api";
import type {
  AuthResponse,
  DeletionStatus,
  LoginInput,
  Membership,
  MeResponse,
  ProfileUpdate,
  RegisterRequestResponse,
  RegisterVerifyInput,
  RegisterVerifyResponse,
  RegistrationConfig,
} from "@/types/auth";
import { ApiError } from "@/types/auth";

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/login", { method: "POST", body: input });
}

export function fetchMe(token: string, signal?: AbortSignal): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me", { token, signal });
}

export function fetchMembership(token: string, signal?: AbortSignal): Promise<Membership> {
  return apiRequest<Membership>("/membership", { token, signal });
}

export function logout(token: string): Promise<unknown> {
  return apiRequest("/logout", { method: "POST", token });
}

export function logoutAll(token: string): Promise<{ ok: boolean; logged_out: boolean }> {
  return apiRequest("/logout-all", { method: "POST", token });
}

export function updateProfile(token: string, body: ProfileUpdate): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me", { method: "PATCH", token, body });
}

export function changePassword(
  token: string,
  body: { current_password: string; new_password: string },
): Promise<{ ok: boolean; reauthenticate: boolean }> {
  return apiRequest("/me/change-password", { method: "POST", token, body });
}

export function fetchDeletion(token: string): Promise<DeletionStatus> {
  return apiRequest<DeletionStatus>("/me/deletion", { token });
}

export async function requestDeletion(token: string, current_password: string): Promise<DeletionStatus> {
  const result = await apiRequest<DeletionStatus>("/me", {
    method: "DELETE",
    token,
    body: { current_password, confirm: true },
  });
  // A 202 alone is not proof — require the documented JSON shape.
  if (!result || result.status !== "requested" || result.request_id == null || !result.due_at) {
    throw new ApiError(
      "We couldn't confirm your deletion request. Please check its status before trying again.",
      "yogarox_invalid_deletion_response",
      0,
    );
  }
  return result;
}

export function fetchRegistration(): Promise<RegistrationConfig> {
  return apiRequest<RegistrationConfig>("/registration");
}

export async function requestRegistrationCode(email: string): Promise<RegisterRequestResponse> {
  const result = await apiRequest<RegisterRequestResponse>("/register", {
    method: "POST",
    body: { email },
  });
  if (!result || result.status !== "verification_required") {
    throw new ApiError(
      "YogaRox returned an unexpected response. Please try again later.",
      "yogarox_invalid_registration_response",
      0,
    );
  }
  return result;
}

export async function verifyRegistration(input: RegisterVerifyInput): Promise<RegisterVerifyResponse> {
  const result = await apiRequest<RegisterVerifyResponse>("/register/verify", {
    method: "POST",
    body: input,
  });
  if (!result || result.status !== "account_created") {
    throw new ApiError(
      "We couldn't confirm your account was created. Try signing in before registering again.",
      "yogarox_registration_unavailable",
      0,
    );
  }
  return result;
}
