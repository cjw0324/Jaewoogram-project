"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SearchParamHandler from "@/components/SearchParamHandler"; // 실제 경로에 맞게 조정

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
  const handleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const authUrl = `${apiBaseUrl}/oauth2/authorization/${provider}`;
    const currentPath = window.location.pathname;

    localStorage.setItem(
      "auth_redirect",
      currentPath !== "/login" ? currentPath : "/"
    );

    window.location.href = authUrl;
  };

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

  const handleGuestAccess = () => {
    localStorage.setItem("auth_redirect", "/");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* 🔥 Suspense로 감싸야 useSearchParams() 에러 방지 가능 */}
        <Suspense fallback={null}>
          <SearchParamHandler />
        </Suspense>

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
