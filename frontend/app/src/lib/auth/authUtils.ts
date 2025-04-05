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
  // 토큰 저장
  set: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  },

  // 토큰 조회
  get: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  },

  // 토큰 삭제
  remove: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },

  // 인증 헤더 생성
  getAuthHeader: () => {
    const token = authToken.get();
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
