package com.example.demo.domain.chat.subscriber;

import com.example.demo.domain.chat.auth.ChatParticipantProvider;
import com.example.demo.domain.chat.controller.dto.ChatMessage;
import com.example.demo.domain.chat.websocket.ChatWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class RedisChatSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatParticipantProvider chatParticipantProvider;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String json = new String(message.getBody());
        System.out.println("📨 Redis 메시지 수신: " + json);

        try {
            ChatMessage dto = objectMapper.readValue(json, ChatMessage.class);
            Long roomId = Long.parseLong(dto.getRoomId());

            // ✅ 해당 채팅방 참여자만 WebSocket 전송
            Set<Long> participantIds = chatParticipantProvider.getParticipantIds(roomId);

            for (Long userId : participantIds) {
                chatWebSocketHandler.sendMessageToUser(userId, json);
                System.out.println("📤 WebSocket 메시지 전송: userId=" + userId + " content=" + json);
            }

        } catch (Exception e) {
            System.err.println("❌ Redis → WebSocket 메시지 전송 실패: " + e.getMessage());
        }
    }
}