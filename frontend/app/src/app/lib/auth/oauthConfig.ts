// src/app/lib/auth/oauthConfig.ts

/**
 * OAuth 제공자별 설정
 */
export const oauthProviders = {
  google: {
    name: "Google",
    // 백엔드의 OAuth 엔드포인트
    authorizationUrl: "/oauth2/authorization/google",
    // 프론트엔드의 콜백 경로
    callbackUrl: "/auth/callback/google",
    // 버튼 스타일
    style: {
      bgColor: "#FFFFFF",
      borderColor: "#DADCE0",
      textColor: "#3C4043",
      hoverBgColor: "#F8F9FA",
    },
  },
  naver: {
    name: "네이버",
    authorizationUrl: "/oauth2/authorization/naver",
    callbackUrl: "/auth/callback/naver",
    style: {
      bgColor: "#03C75A",
      borderColor: "#03C75A",
      textColor: "#FFFFFF",
      hoverBgColor: "#02B350",
    },
  },
  kakao: {
    name: "카카오",
    authorizationUrl: "/oauth2/authorization/kakao",
    callbackUrl: "/auth/callback/kakao",
    style: {
      bgColor: "#FEE500",
      borderColor: "#FEE500",
      textColor: "#000000",
      hoverBgColor: "#FDDC3F",
    },
  },
};

/**
 * OAuth 요청 URL 생성
 */
export const createOAuthUrl = (provider: "google" | "naver" | "kakao") => {
  // 환경에 따른 API 기본 URL 가져오기
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const providerConfig = oauthProviders[provider];

  // 현재 경로 저장 (로그인 후 원래 페이지로 돌아오기 위해)
  localStorage.setItem("auth_redirect", window.location.pathname);

  // 간단하게 OAuth 요청 URL만 반환 (백엔드에서 리다이렉트 처리를 맡길 경우)
  return `${apiBaseUrl}${providerConfig.authorizationUrl}`;
};
