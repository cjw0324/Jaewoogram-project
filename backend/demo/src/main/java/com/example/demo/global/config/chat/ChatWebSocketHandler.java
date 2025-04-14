package com.example.demo.global.config.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final Map<Long, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userIdParam = UriComponentsBuilder.fromUri(session.getUri()).build().getQueryParams().getFirst("userId");
        Long userId = Long.valueOf(userIdParam);

        sessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
        System.out.println("🔌 WebSocket 연결됨: userId = " + userId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.forEach((userId, sessionSet) -> sessionSet.remove(session));
        System.out.println("❌ WebSocket 연결 종료됨");
    }

    public void sendMessageToUser(Long userId, String json) throws IOException {
        Set<WebSocketSession> userSessions = sessions.get(userId);
        if (userSessions != null) {
            for (WebSocketSession session : userSessions) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(json));
                    System.out.println("📤 WebSocket 메시지 전송: userId=" + userId + " content=" + json);
                }
            }
        }
    }

    public Set<Long> getAllConnectedUserIds() {
        return sessions.keySet();
    }


}
