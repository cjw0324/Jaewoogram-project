package com.example.demo.domain.notice.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private NotificationType type;      // 알림 타입
    private Long receiverId;            // 알림 받을 사용자 ID
    private Long senderId;              // 알림 보낸 사용자 ID
    private String senderNickname;      // 보낸 사람 닉네임
    private Map<String, Object> data;   // 타입별 추가 정보 (postId, commentId 등)
}
