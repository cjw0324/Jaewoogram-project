// src/app/dashboard/page.tsx
"use client";

import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../../lib/auth/AuthProvider";

export default function DashboardPage() {
  // 이 페이지는 ProtectedRoute로 감싸져 있어 인증된 사용자만 접근 가능
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">대시보드</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">사용자 정보</h2>
          {user ? (
            <div>
              <p>
                <span className="font-medium">이름:</span> {user.name}
              </p>
              <p>
                <span className="font-medium">이메일:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">ID:</span> {user.id}
              </p>
            </div>
          ) : (
            <p>사용자 정보를 불러오는 중...</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 대시보드 카드 예시 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">최근 활동</h3>
            <p className="text-gray-600">아직 활동 내역이 없습니다.</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">통계</h3>
            <p className="text-gray-600">통계 데이터를 불러오는 중...</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">알림</h3>
            <p className="text-gray-600">새로운 알림이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
