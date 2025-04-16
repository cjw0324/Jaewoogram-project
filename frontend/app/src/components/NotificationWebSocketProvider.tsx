"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useNotificationStore } from "@/app/stores/notificationStore";
import { NotificationType } from "@/app/types/notification";

const NotificationSocketContext = createContext<WebSocket | null>(null);

interface NotificationMessage {
  type: NotificationType;
  receiverId: number;
  senderId: number;
  senderNickname: string;
  data: Record<string, any>;
  createdAt: string;
}

export const useNotificationSocket = () =>
  useContext(NotificationSocketContext);

export function NotificationWebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // ✅ useEffect는 항상 실행되고, 내부 조건으로 분기
    if (!user?.id) return;

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_BASE_URL}/notifications?userId=${user.id}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ 알림 WebSocket 연결됨");
    };

    socket.onmessage = (event) => {
      try {
        const newNotification: NotificationMessage = JSON.parse(event.data);

        // 🔴 기존 알림 목록을 localStorage에서 불러오기
        const existing = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );

        // 🟢 최신 알림 먼저 보여주기 위해 prepend
        const updated = [newNotification, ...existing];

        // 💾 저장
        localStorage.setItem("notifications", JSON.stringify(updated));

        // 🔔 빨간 점 표시
        useNotificationStore.getState().setUnread(true);
      } catch (e) {
        console.error("❌ 알림 저장 실패", e);
      }
    };

    socket.onclose = () => {
      console.log("❌ 알림 WebSocket 종료됨");
    };

    socket.onerror = (e) => {
      console.error("⚠️ WebSocket 에러", e);
    };

    // ✅ ping 보내는 keep-alive
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 30000);

    return () => {
      socket.close();
      clearInterval(pingInterval);
    };
  }, [user?.id]);

  return (
    <NotificationSocketContext.Provider value={socketRef.current}>
      {children}
    </NotificationSocketContext.Provider>
  );
}
