import React, { Suspense } from "react";
import SignUpClient from "./SignUpClient";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SignUpClient />
    </Suspense>
  );
}
