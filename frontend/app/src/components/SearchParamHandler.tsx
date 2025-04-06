// components/SearchParamHandler.tsx
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

const SearchParamHandler = () => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  React.useEffect(() => {
    if (redirect) {
      const decodedRedirect = decodeURIComponent(redirect);
      if (decodedRedirect && decodedRedirect !== "/login") {
        localStorage.setItem("auth_redirect", decodedRedirect);
      } else {
        localStorage.setItem("auth_redirect", "/");
      }
    } else {
      localStorage.setItem("auth_redirect", "/");
    }
  }, [redirect]);

  return null; // UI 요소가 없고 로직만 수행
};

export default SearchParamHandler;
