// src/lib/auth/fetchWithAuth.ts
import { refreshToken } from "./refreshToken";
import { logout } from "./logout";

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "include", // 쿠키 인증 포함
  });

  if (response.status !== 401) {
    return response;
  }

  console.warn("🔁 accessToken 만료 → refreshToken 요청 중...");

  const refreshed = await refreshToken();

  if (!refreshed) {
    console.error("🚫 refreshToken 재발급 실패 → 로그아웃");
    await logout();
    throw new Error("로그인이 만료되었습니다.");
  }

  // ✅ 재발급 성공 → 원래 요청 재시도
  const retryResponse = await fetch(input, {
    ...init,
    credentials: "include",
  });

  return retryResponse;
}
