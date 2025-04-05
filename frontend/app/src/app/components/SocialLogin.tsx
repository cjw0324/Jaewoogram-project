// src/app/components/SocialLogin.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./SocialLogin.css";
import { createOAuthUrl, oauthProviders } from "../lib/auth/oauthConfig";

interface SocialLoginButtonProps {
  provider: "google" | "naver" | "kakao";
  text: string;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  text,
}) => {
  const router = useRouter();

  const handleLogin = () => {
    // OAuth 인증 URL 생성 함수 사용
    const oauthUrl = createOAuthUrl(provider);

    // OAuth 서비스로 리다이렉트
    window.location.href = oauthUrl;
  };

  // oauthConfig에서 정의한 스타일 사용
  const { bgColor, borderColor, textColor } = oauthProviders[provider].style;

  return (
    <button
      className="social-button"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
      onClick={handleLogin}
    >
      <div className="button-content">
        <div className="logo-container">
          <Image
            src={`/images/${provider}-logo.svg`}
            alt={`${provider} logo`}
            width={24}
            height={24}
            className="logo"
          />
        </div>
        <span>{text}</span>
      </div>
    </button>
  );
};

const SocialLogin: React.FC = () => {
  return (
    <div className="social-login-container">
      <SocialLoginButton provider="google" text="Google로 로그인" />
      <SocialLoginButton provider="naver" text="네이버로 로그인" />
      <SocialLoginButton provider="kakao" text="카카오로 로그인" />
    </div>
  );
};

export default SocialLogin;
