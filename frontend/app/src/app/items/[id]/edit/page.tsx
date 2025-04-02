// app/items/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ItemResponseDto } from "../../../types/item";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`
      );
      const data: ItemResponseDto = await res.json();
      setItemName(data.itemName);
    };
    fetchItem();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemName }),
    });
    router.push(`/items/${id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">✏️ 아이템 수정</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          수정하기
        </button>
      </form>
    </div>
  );
}
