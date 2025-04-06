// src/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(
  method: RequestMethod,
  path: string,
  body?: unknown
): Promise<T> {
  console.log("baseUrl", API_BASE_URL);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 쿠키 자동 포함
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // 401 오류 시 토큰 재발급 시도
  if (res.status === 401) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/reissue`, {
        method: "POST",
        credentials: "include",
      });

      // 토큰 재발급 성공 시 원래 요청 재시도
      if (refreshResponse.ok) {
        const retryRes = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          ...(body ? { body: JSON.stringify(body) } : {}),
        });

        if (retryRes.ok) {
          return retryRes.json();
        }
      }
    } catch (error) {
      console.error("토큰 재발급 실패:", error);
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

// 단일 메서드로 분리
export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
