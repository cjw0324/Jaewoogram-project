package com.example.demo.domain.notice.websocket;

import com.example.demo.domain.notice.entity.Notification;
import com.example.demo.domain.notice.message.NotificationMessage;
import com.example.demo.domain.notice.message.NotificationType;
import com.example.demo.domain.notice.repository.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = getUserIdFromQuery(session); // 쿼리에서 userId 파싱
        if (userId != null) {
            sessions.put(userId, session);
            log.info("🔌 Notification WebSocket 연결됨: {}", userId);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) {}

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket 오류", exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
        String userId = getUserIdFromQuery(session);
        if (userId != null) {
            sessions.remove(userId);
            log.info("🔌 Notification WebSocket 연결 종료: {}", userId);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    public void sendMessageToUser(String userId, String messageJson) {
        WebSocketSession session = sessions.get(userId);

        if (session != null && session.isOpen()) {
            try {
                log.info("📨 {}에게 WebSocket 메시지 전송 시도: {}", userId, messageJson);
                session.sendMessage(new TextMessage(messageJson));
                log.info("✅ WebSocket 전송 성공");
                return; // 🔁 전송 성공했으면 DB 저장하지 않음
            } catch (Exception e) {
                log.error("❌ WebSocket 전송 실패", e);
            }
        } else {
            log.warn("❌ WebSocket 세션 없음 또는 닫힘: {}", userId);
        }

        // 🔁 WebSocket 전송 실패 시 → DB 저장
        try {
            saveNotificationToDb(userId, messageJson);

        } catch (Exception ex) {
            log.error("❌ WebSocket 실패 후 DB 저장도 실패함", ex);
        }
    }

    private void saveNotificationToDb(String userId, String messageJson) throws JsonProcessingException {
        NotificationMessage parsed = objectMapper.readValue(messageJson, NotificationMessage.class);

        Notification notification = Notification.builder()
                .receiverId(parsed.getReceiverId())
                .senderId(parsed.getSenderId())
                .senderNickname(parsed.getSenderNickname())
                .type(NotificationType.valueOf(parsed.getType().name()))
                .data(objectMapper.writeValueAsString(parsed.getData()))
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("💾 WebSocket 실패 → DB에 알림 저장 완료 (receiverId: {})", userId);
    }


    private String getUserIdFromQuery(WebSocketSession session) {
        String query = session.getUri().getQuery(); // ex: userId=123
        if (query != null && query.startsWith("userId=")) {
            return query.split("=")[1];
        }
        return null;
    }
}
