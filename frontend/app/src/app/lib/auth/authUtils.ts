// src/app/lib/auth/authUtils.ts
"use client";

/**
 * 인증 유틸리티 함수 모음
 */

/**
 * 소셜 로그인 URL 생성
 */
export const createSocialLoginUrl = (
  provider: "google" | "naver" | "kakao",
  redirectUri?: string
) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const loginEndpoint = `/login/oauth2/code/${provider}`;

  // 리다이렉트 URI가 제공되지 않으면 현재 URL 사용
  const redirect =
    redirectUri || (typeof window !== "undefined" ? window.location.href : "");
  const encodedRedirectUri = encodeURIComponent(redirect);

  return `${apiBaseUrl}${loginEndpoint}?redirect_uri=${encodedRedirectUri}`;
};

/**
 * 토큰 관련 함수
 */
export const authToken = {
  // 액세스 토큰 저장
  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_access_token", token);
    }
  },

  // 리프레시 토큰 저장
  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_refresh_token", token);
    }
  },

  // 사용자 역할 저장
  setUserRole: (role: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user_role", role);
    }
  },

  // 액세스 토큰 조회
  getAccessToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_access_token");
    }
    return null;
  },

  // 리프레시 토큰 조회
  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_refresh_token");
    }
    return null;
  },

  // 사용자 역할 조회
  getUserRole: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_user_role");
    }
    return null;
  },

  // 모든 인증 정보 삭제
  removeAll: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_access_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user_role");
    }
  },

  // 인증 헤더 생성
  getAuthHeader: () => {
    const token = authToken.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

/**
 * 리다이렉트 URL 저장/조회
 */
export const authRedirect = {
  set: (url: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_redirect", url);
    }
  },

  get: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_redirect");
    }
    return null;
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_redirect");
    }
  },
};
