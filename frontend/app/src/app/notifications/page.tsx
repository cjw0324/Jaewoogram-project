// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/lib/auth/AuthProvider"; // ← 너가 쓰는 auth 경로 기준

// interface Notification {
//   postId: number;
//   senderNickname: string;
//   message: string;
// }

// export default function NotificationPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const { user } = useAuth(); // ✅ 로그인된 유저 정보 가져오기

//   useEffect(() => {
//     if (!user?.id) return; // 아직 user 정보 안 들어왔으면 대기

//     const baseWsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;
//     const socket = new WebSocket(
//       `${baseWsUrl}/notifications?userId=${user.id}`
//     );

//     socket.onopen = () => {
//       console.log("✅ WebSocket 연결됨");
//     };

//     socket.onmessage = (event) => {
//       console.log("📥 WebSocket 메시지 수신:", event.data);
//       try {
//         const data = JSON.parse(event.data);
//         const newNotification: Notification = {
//           postId: data.postId,
//           senderNickname: data.senderNickname,
//           message: `${data.senderNickname}님이 회원님의 게시글(${data.postId})을 좋아했습니다.`,
//         };
//         setNotifications((prev) => [newNotification, ...prev]);
//       } catch (e) {
//         console.error("❌ 메시지 파싱 실패", e);
//       }
//     };

//     socket.onclose = () => {
//       console.log("❌ WebSocket 연결 종료됨");
//     };

//     return () => {
//       socket.close();
//     };
//   }, [user?.id]); // ← user.id 들어올 때 WebSocket 연결 시도

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-semibold mb-4">🔔 알림</h1>
//       {notifications.length === 0 ? (
//         <p>알림이 없습니다.</p>
//       ) : (
//         <ul className="space-y-2">
//           {notifications.map((n, idx) => (
//             <li key={idx} className="p-3 border rounded shadow">
//               {n.message}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
