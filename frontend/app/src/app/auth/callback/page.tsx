import React, { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>OAuth 처리 중입니다...</div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
