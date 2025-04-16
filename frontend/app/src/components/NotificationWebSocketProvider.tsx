"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useNotificationStore } from "@/app/stores/notificationStore";

const NotificationSocketContext = createContext<WebSocket | null>(null);

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
      console.log("📥 알림 수신:", event.data);
      useNotificationStore.getState().setUnread(true);
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
