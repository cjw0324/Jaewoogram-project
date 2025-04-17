package com.example.demo.domain.chat.auth;

import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ChatParticipantProvider {

    private final ChatRoomRepository chatRoomRepository;

    /**
     * 채팅방에 참여 중인 모든 userId를 반환
     */
    @Transactional(readOnly = true)
    public Set<Long> getParticipantIds(Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        return room.getParticipants().stream()
                .map(participant -> participant.getUserId())
                .collect(Collectors.toSet());
    }
}