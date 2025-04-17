package com.example.demo.domain.chat.service;

import com.example.demo.domain.chat.controller.dto.ChatMessage;
import com.example.demo.domain.chat.controller.dto.ChatMessageResponse;
import com.example.demo.domain.chat.controller.dto.SendChatMessageRequest;
import com.example.demo.domain.chat.entity.ChatMessageEntity;
import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.entity.ChatRoomParticipant;
import com.example.demo.domain.chat.producer.ChatKafkaProducer;
import com.example.demo.domain.chat.publisher.RedisChatPublisher;
import com.example.demo.domain.chat.repository.ChatMessageRepository;
import com.example.demo.domain.chat.repository.ChatParticipantRepository;
import com.example.demo.domain.chat.repository.ChatRoomRepository;
import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.notice.message.NotificationMessage;
import com.example.demo.domain.notice.message.NotificationType;
import com.example.demo.domain.notice.producer.NotificationProducer;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisChatPublisher redisChatPublisher;
    private final ObjectMapper objectMapper;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatKafkaProducer chatKafkaProducer;
    private final NotificationProducer notificationProducer;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    @Transactional
    public void chatToMessage(SendChatMessageRequest message, JwtAuthentication auth) {

        User user = userRepository.findById(auth.getUserId()).orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));

        ChatMessage kafkaMessage = ChatMessage.builder()
                .roomId(String.valueOf(message.getRoomId()))
                .senderId(user.getId())
                .nickname(user.getNickname())
                .content(message.getContent())
                .messageType("TALK")
                .createdAt(LocalDateTime.now())
                .build();


        sendNotification(kafkaMessage, user, getParticipantId(message.getRoomId(), user.getId()));
        chatKafkaProducer.sendChatMessage(kafkaMessage);
    }

    public Long getParticipantId(Long roomId, Long senderId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        List<ChatRoomParticipant> participants = chatParticipantRepository.findByRoomId(room.getId());

        return participants.stream()
                .map(ChatRoomParticipant::getUserId)
                .filter(id -> !id.equals(senderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("DM 대상 유저를 찾을 수 없습니다."));
    }

    public void sendNotification(ChatMessage message, User user, Long receiverId) {
        Map<String, Object> data = new HashMap<>();
        data.put("roomId", message.getRoomId());
        data.put("content", message.getContent());



        notificationProducer.sendNotification(
                new NotificationMessage(
                        NotificationType.DM,
                        receiverId,
                        user.getId(),
                        user.getNickname(),
                        data
                )
        );
    }

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
        ChatRoomParticipant participant = chatParticipantRepository
                .findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방에 참여하고 있지 않습니다."));

        List<ChatMessageEntity> messages = chatMessageRepository
                .findMessagesAfterJoinedAt(roomId, participant.getJoinedAt());

        return messages.stream()
                .map(this::entity2Response)
                .toList();
    }
}
