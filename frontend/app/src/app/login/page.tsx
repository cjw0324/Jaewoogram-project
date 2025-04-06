// src/app/login/page.tsx
"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// 소셜 로그인 제공자 타입
type Provider = "google" | "naver" | "kakao";

// 소셜 로그인 버튼 컴포넌트
const SocialLoginButton = ({
  provider,
  text,
}: {
  provider: Provider;
  text: string;
}) => {
  // OAuth URL 생성
  const handleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const authUrl = `${apiBaseUrl}/oauth2/authorization/${provider}`;
    // 현재 경로 또는 기본 메인 페이지로 리다이렉트 설정
    const currentPath = window.location.pathname;
    localStorage.setItem(
      "auth_redirect",
      currentPath !== "/login" ? currentPath : "/"
    );

    // OAuth 페이지로 리다이렉트
    window.location.href = authUrl;
  };

  // 제공자별 스타일
  const styles = {
    google: {
      bg: "bg-white",
      border: "border-gray-300",
      text: "text-gray-800",
    },
    naver: {
      bg: "bg-[#03C75A]",
      border: "border-[#03C75A]",
      text: "text-white",
    },
    kakao: {
      bg: "bg-[#FEE500]",
      border: "border-[#FEE500]",
      text: "text-black",
    },
  };

  const style = styles[provider];

  return (
    <button
      className={`w-full flex items-center justify-center py-3 px-4 rounded-md ${style.bg} ${style.border} ${style.text} border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-3`}
      onClick={handleLogin}
    >
      <div className="w-5 h-5 mr-3">
        <Image
          src={`/images/${provider}-logo.svg`}
          alt={`${provider} logo`}
          width={20}
          height={20}
        />
      </div>
      <span>{text}</span>
    </button>
  );
};

// 로그인 페이지 컴포넌트
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // redirect 파라미터가 있으면 저장
  React.useEffect(() => {
    if (redirect) {
      // 디코딩된 리다이렉트 경로 사용
      const decodedRedirect = decodeURIComponent(redirect);

      // /login 페이지로의 리다이렉트는 무시
      if (decodedRedirect && decodedRedirect !== "/login") {
        localStorage.setItem("auth_redirect", decodedRedirect);
      } else {
        localStorage.setItem("auth_redirect", "/");
      }
    } else {
      // 리다이렉트 파라미터 없으면 기본값으로 /
      localStorage.setItem("auth_redirect", "/");
    }
  }, [redirect]);

  // 비회원 이용하기 핸들러
  const handleGuestAccess = () => {
    // 기본 리다이렉트 경로를 메인 페이지로 설정
    localStorage.setItem("auth_redirect", "/");

    // 메인 페이지로 이동
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            소셜 계정으로 간편하게 로그인하세요
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <SocialLoginButton provider="google" text="Google로 로그인" />
          <SocialLoginButton provider="naver" text="네이버로 로그인" />
          <SocialLoginButton provider="kakao" text="카카오로 로그인" />

          {/* 비회원 이용하기 버튼 추가 */}
          <button
            onClick={handleGuestAccess}
            className="w-full py-3 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            비회원으로 이용하기
          </button>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
