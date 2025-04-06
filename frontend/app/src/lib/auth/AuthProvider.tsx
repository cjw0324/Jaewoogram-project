"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { refreshToken } from "./refreshToken";
import { logout as logoutUser } from "./logout"; // 유틸에서 불러옴

// 사용자 정보 타입
interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
}

// 인증 컨텍스트 타입
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>; // 사용자 정보 갱신 함수 추가
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 커스텀 훅 - 컴포넌트에서 인증 컨텍스트에 접근할 수 있게 함
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      console.log("사용자 정보 조회 시작");

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/user/me`, {
        credentials: "include", // 쿠키 포함
      });

      console.log("사용자 정보 조회 응답:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("사용자 정보 조회 성공:", userData);
        setUser(userData);
      } else if (response.status === 401) {
        // 인증 실패 시 토큰 재발급 시도
        console.log("인증 만료, 토큰 재발급 시도");
        const refreshed = await refreshToken();

        if (!refreshed) {
          console.log("토큰 재발급 실패, 사용자 정보 초기화");
          setUser(null);
        } else {
          console.log("토큰 재발급 성공 → 사용자 정보 재요청");
          const retry = await fetch(`${apiBaseUrl}/user/me`, {
            credentials: "include",
          });
          if (retry.ok) {
            const userData = await retry.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        }
      } else {
        console.log("사용자 정보 조회 실패, 상태 코드:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("사용자 정보 조회 에러:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리 함수 (Context용)
  const logout = async () => {
    await logoutUser(); // 유틸 함수 호출
    setUser(null);
  };

  useEffect(() => {
    console.log("AuthProvider 마운트됨");
    fetchUserInfo();

    // 포커스 시 재조회 제거 또는 debounce 처리 (지금은 제거)
    // window.addEventListener("focus", handleFocus);
    // return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // 인증 컨텍스트 값
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
    fetchUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
