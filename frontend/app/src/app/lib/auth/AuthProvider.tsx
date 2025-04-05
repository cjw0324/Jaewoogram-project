// src/app/lib/auth/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // 필요한 사용자 정보 필드 추가
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // 로컬 스토리지에서 토큰 확인 (클라이언트 사이드에서만 실행)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_access_token");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 토큰을 통해 사용자 정보 가져오기
        try {
          // 토큰에서 사용자 정보 추출 (간단한 방법)
          const userRole = localStorage.getItem("auth_user_role");

          // JWT 디코딩 (간단한 방법)
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));

            // 사용자 정보 설정
            setUser({
              id: payload.userId || payload.sub || "",
              name: payload.name || "",
              email: payload.email || "",
              role: userRole || payload.userRole || "",
            });
          }
        } catch (err) {
          console.error("토큰 디코딩 오류:", err);

          // 백엔드 API를 통해 사용자 정보 가져오기 (대체 방법)
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
          const response = await fetch(`${apiBaseUrl}/user/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // 토큰이 유효하지 않은 경우
            localStorage.removeItem("auth_access_token");
            localStorage.removeItem("auth_refresh_token");
            localStorage.removeItem("auth_user_role");
            setUser(null);
            setError("인증 세션이 만료되었습니다.");
          }
        }
      }
    } catch (error) {
      setError("인증 상태 확인 중 오류가 발생했습니다.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_access_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user_role");
    }
    setUser(null);
    router.push("/login");
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
