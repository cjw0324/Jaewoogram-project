"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch("http://jaewoo.site/");
        const text = await res.text();
        setMessage(text);
      } catch (error) {
        console.error("Failed to fetch:", error);
        setMessage("Failed to fetch data");
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center text-base sm:text-left">
          <p className="mb-4 font-semibold">✅ 응답 결과:</p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded max-w-md overflow-auto">
            {message}
          </pre>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* Footer 생략 */}
      </footer>
    </div>
  );
}
