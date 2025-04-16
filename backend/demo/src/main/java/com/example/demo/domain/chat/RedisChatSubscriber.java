package com.example.demo.domain.chat;

import com.example.demo.global.config.asynchronous.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisChatSubscriber implements MessageListener {

    private final ChatWebSocketHandler chatWebSocketHandler;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String body = new String(message.getBody());
        System.out.println("📨 Redis 메시지 수신: " + body);

        try {
            for (Long userId : chatWebSocketHandler.getAllConnectedUserIds()) {
                chatWebSocketHandler.sendMessageToUser(userId, body);
                System.out.println("📤 WebSocket 메시지 전송: userId=" + userId + " content=" + body);
            }
        } catch (Exception e) {
            System.err.println("❌ Redis → WebSocket 메시지 전송 실패: " + e.getMessage());
        }
    }
}