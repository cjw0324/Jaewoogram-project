// src/app/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 인증 로딩이 완료되었고 인증되지 않은 경우
    if (!loading && !isAuthenticated) {
      // 현재 경로를 인코딩하여 로그인 후 리다이렉트할 수 있도록 함
      const encodedPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${encodedPath}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}
