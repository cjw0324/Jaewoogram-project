package com.example.demo.domain.chat.service;

import com.example.demo.domain.chat.controller.dto.ChatMessage;
import com.example.demo.domain.chat.controller.dto.ChatMessageResponse;
import com.example.demo.domain.chat.entity.ChatMessageEntity;
import com.example.demo.domain.chat.entity.ChatRoomParticipant;
import com.example.demo.domain.chat.publisher.RedisChatPublisher;
import com.example.demo.domain.chat.repository.ChatMessageRepository;
import com.example.demo.domain.chat.repository.ChatRoomParticipantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisChatPublisher redisChatPublisher;
    private final ObjectMapper objectMapper;
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;

    @Transactional
    public void handleIncomingMessage(String messageJson) {
        try {
            ChatMessage dto = objectMapper.readValue(messageJson, ChatMessage.class);
            ChatMessageEntity entity = dto2Entity(dto);
            chatMessageRepository.save(entity);

            redisChatPublisher.publish("chat-channel", messageJson);
        } catch (Exception e) {
            throw new RuntimeException("메시지 처리 실패: " + e.getMessage(), e);
        }
    }

    private ChatMessageEntity dto2Entity(ChatMessage dto) {
        return ChatMessageEntity.builder()
                .roomId(dto.getRoomId() != null ? Long.parseLong(dto.getRoomId()) : null)
                .senderId(dto.getSenderId())
                .nickname(dto.getNickname())
                .content(dto.getContent())
                .messageType(dto.getMessageType())
                .build();
    }

    private ChatMessageResponse entity2Response(ChatMessageEntity entity) {
        return ChatMessageResponse.builder()
                .messageId(entity.getId())
                .senderId(entity.getSenderId())
                .nickname(entity.getNickname())
                .content(entity.getContent())
                .messageType(entity.getMessageType())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessagesVisibleToUser(Long roomId, Long userId) {
        // 참가자 조회 + joinedAt 가져오기
        ChatRoomParticipant participant = chatRoomParticipantRepository
                .findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방에 참여하고 있지 않습니다."));

        List<ChatMessageEntity> messages = chatMessageRepository
                .findMessagesAfterJoinedAt(roomId, participant.getJoinedAt());

        return messages.stream()
                .map(this::entity2Response)
                .toList();
    }
}
