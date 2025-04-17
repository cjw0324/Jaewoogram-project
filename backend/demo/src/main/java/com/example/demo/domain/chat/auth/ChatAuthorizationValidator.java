package com.example.demo.domain.chat.auth;

import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.repository.ChatRoomRepository;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatAuthorizationValidator {

    private final ChatRoomRepository chatRoomRepository;

    public void validateParticipant(Long roomId, Long userId) {
        ChatRoom room = getExistingRoom(roomId);

        if (!isUserInRoom(room, userId)) {
            throw new SecurityException("이 채팅방에 접근할 수 없습니다.");
        }
    }

    private ChatRoom getExistingRoom(Long roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));
    }

    private boolean isUserInRoom(ChatRoom room, Long userId) {
        return room.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(userId));
    }

}
