// src/components/ProtectedRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // 로딩이 완료되고 인증되지 않은 경우
      if (!loading && !isAuthenticated) {
        const currentPath = window.location.pathname;
        const encodedPath = encodeURIComponent(currentPath);
        router.push(`/login?redirect=${encodedPath}`);
      }
    };

    checkAuth();
  }, [isAuthenticated, loading, router]);

  // 로딩 중이거나 인증 확인 중인 경우
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 상태를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않았으면 null 반환
  if (!isAuthenticated) {
    return null;
  }

  // 인증되었으면 자식 컴포넌트 렌더링
  return <>{children}</>;
}
