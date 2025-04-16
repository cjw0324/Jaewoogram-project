// src/components/ClientProviders.tsx
"use client";

import { NotificationWebSocketProvider } from "./NotificationWebSocketProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationWebSocketProvider>{children}</NotificationWebSocketProvider>
  );
}
