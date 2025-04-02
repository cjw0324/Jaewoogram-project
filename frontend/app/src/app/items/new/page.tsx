// app/items/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewItemPage() {
  const [itemName, setItemName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemName }),
    });
    router.push("/items");
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">➕ 아이템 생성</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="아이템 이름"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          생성하기
        </button>
      </form>
    </div>
  );
}
