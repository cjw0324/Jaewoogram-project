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
      icon: "/images/google-logo.svg",
    },
    naver: {
      bg: "bg-[#03C75A]",
      border: "border-[#03C75A]",
      text: "text-white",
      icon: "/images/naver-logo.svg",
    },
    kakao: {
      bg: "bg-[#FEE500]",
      border: "border-[#FEE500]",
      text: "text-black",
      icon: "/images/kakao-logo.svg",
    },
  };

  const style = styles[provider];

  return (
    <button
      className={`w-full flex items-center justify-center py-2 px-4 rounded ${style.bg} ${style.border} ${style.text} border font-medium text-sm mb-3 focus:outline-none`}
      onClick={handleLogin}
    >
      <div className="w-5 h-5 mr-3 flex items-center justify-center">
        <Image
          src={style.icon}
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-6 px-4">
      {/* 🔥 Suspense로 감싸야 useSearchParams() 에러 방지 가능 */}
      <Suspense fallback={null}>
        <SearchParamHandler />
      </Suspense>

      <div className="max-w-xs w-full">
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <div className="text-4xl font-semibold font-serif italic">
            Jaewoogram
          </div>
        </div>

        {/* 로그인 영역 */}
        <div className="bg-white p-5 border border-gray-200 rounded mb-3">
          <div className="mb-6">
            <h2 className="text-center text-lg font-medium text-gray-800">
              로그인
            </h2>
            <p className="text-center text-xs text-gray-500 mt-1">
              소셜 계정으로 간편하게 로그인하세요
            </p>
          </div>

          <div className="space-y-3">
            <SocialLoginButton provider="google" text="Google로 로그인" />
            <SocialLoginButton provider="naver" text="네이버로 로그인" />
            <SocialLoginButton provider="kakao" text="카카오로 로그인" />
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <div className="px-4 text-xs text-gray-500 uppercase">또는</div>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGuestAccess}
            className="w-full py-2 px-4 rounded bg-transparent text-blue-500 text-sm font-medium hover:text-blue-600 focus:outline-none"
          >
            비회원으로 이용하기
          </button>
        </div>

        {/* 푸터 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mt-4">
            © 2025 Jaewoo's toy project
          </p>
        </div>
      </div>
    </div>
  );
}
