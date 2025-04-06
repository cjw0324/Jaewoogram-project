// src/lib/apiClient.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(
  method: RequestMethod,
  path: string,
  body?: unknown,
  disableLogging: boolean = false
): Promise<T> {
  // API 요청 정보 로깅
  if (!disableLogging) {
    console.log(`[API 요청] ${method} ${path}`);
    if (body) {
      console.log("[API 요청 본문]", body);
    }
  }

  const url = `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 쿠키 자동 포함
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    // 응답 정보 로깅
    if (!disableLogging) {
      console.log(`[API 응답] ${method} ${path} 상태 코드:`, res.status);
    }

    // 401 오류 시 토큰 재발급 시도
    if (res.status === 401) {
      console.log("[API] 인증 만료, 토큰 재발급 시도");
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/reissue`, {
          method: "POST",
          credentials: "include",
        });

        console.log("[토큰 재발급] 상태 코드:", refreshResponse.status);

        // 토큰 재발급 성공 시 원래 요청 재시도
        if (refreshResponse.ok) {
          console.log("[토큰 재발급] 성공, 원래 요청 재시도");
          const retryRes = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            ...(body ? { body: JSON.stringify(body) } : {}),
          });

          console.log("[API 재시도] 상태 코드:", retryRes.status);

          if (retryRes.ok) {
            const data = await retryRes.json();
            return data;
          } else {
            console.error("[API 재시도] 실패");
            throw new Error(`Request retry failed: ${retryRes.status}`);
          }
        } else {
          console.error("[토큰 재발급] 실패");
        }
      } catch (error) {
        console.error("[토큰 재발급] 에러:", error);
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API 오류] ${method} ${path}:`, errorText);
      throw new Error(`Request failed: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    if (!disableLogging) {
      console.log(`[API 응답 데이터] ${method} ${path}:`, data);
    }
    return data;
  } catch (error) {
    console.error(`[API 예외] ${method} ${path}:`, error);
    throw error;
  }
}

// 단일 메서드로 분리
export const api = {
  get: <T>(path: string, disableLogging: boolean = false) =>
    request<T>("GET", path, undefined, disableLogging),
  post: <T>(path: string, body: unknown, disableLogging: boolean = false) =>
    request<T>("POST", path, body, disableLogging),
  put: <T>(path: string, body: unknown, disableLogging: boolean = false) =>
    request<T>("PUT", path, body, disableLogging),
  delete: <T>(path: string, disableLogging: boolean = false) =>
    request<T>("DELETE", path, undefined, disableLogging),
};
