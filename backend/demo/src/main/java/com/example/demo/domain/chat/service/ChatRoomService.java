package com.example.demo.domain.chat.service;

import com.example.demo.domain.chat.auth.ChatAuthorizationValidator;
import com.example.demo.domain.chat.controller.dto.ChatRoomSummaryResponse;
import com.example.demo.domain.chat.controller.dto.CreateGroupRoomRequest;
import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.entity.ChatRoomParticipant;
import com.example.demo.domain.chat.entity.ChatRoomType;
import com.example.demo.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatAuthorizationValidator authorizationValidator;

    @Transactional
    public ChatRoom findOrCreateDirectRoom(Long userId1, Long userId2, Long requesterId) {
        Long[] sorted = sortUserIds(userId1, userId2);
        Long id1 = sorted[0];
        Long id2 = sorted[1];

        // 숨김 여부 상관없이 모든 방을 가져옴
        List<ChatRoom> rooms = chatRoomRepository.findAllDirectChatRooms(id1, id2, ChatRoomType.DIRECT);

        for (ChatRoom room : rooms) {
            boolean allDeleted = room.getParticipants().stream().allMatch(ChatRoomParticipant::isDeleted);

            if (allDeleted) continue; // ❌ 모두 숨김 상태면 건너뜀

            // ✅ 요청자 복구만 수행
            room.getParticipants().stream()
                    .filter(p -> p.getUserId().equals(requesterId) && p.isDeleted())
                    .forEach(p -> {
                        p.setDeleted(false);
                        p.setJoinedAt(LocalDateTime.now());
                    });

            return room;
        }

        // ✅ 재사용 가능한 방이 없다면 새로 생성
        return createDirectRoom(id1, id2);
    }

    private Long[] sortUserIds(Long a, Long b) {
        return a < b ? new Long[]{a, b} : new Long[]{b, a};
    }

    @Transactional
    public ChatRoom createDirectRoom(Long userId1, Long userId2) {
        ChatRoom room = ChatRoom.builder()
                .type(ChatRoomType.DIRECT)
                .build();
        room.getParticipants().add(createParticipant(userId1, room));
        room.getParticipants().add(createParticipant(userId2, room));
        return chatRoomRepository.save(room);
    }

    @Transactional
    public ChatRoom createGroupRoom(String roomName, List<Long> userIds) {
        ChatRoom room = ChatRoom.builder()
                .type(ChatRoomType.GROUP)
                .roomName(roomName)
                .build();
        addParticipantsToRoom(room, userIds);
        return chatRoomRepository.save(room);
    }

    private void addParticipantsToRoom(ChatRoom room, List<Long> userIds) {
        List<ChatRoomParticipant> participants = userIds.stream()
                .map(userId -> createParticipant(userId, room))
                .toList();
        room.getParticipants().addAll(participants);
    }

    private ChatRoomParticipant createParticipant(Long userId, ChatRoom room) {
        return ChatRoomParticipant.builder()
                .userId(userId)
                .room(room)
                .joinedAt(LocalDateTime.now())
                .build();
    }

    private List<Long> mergeWithCreator(List<Long> participantIds, Long creatorId) {
        Set<Long> uniqueIds = new HashSet<>(participantIds);
        uniqueIds.add(creatorId);
        return new ArrayList<>(uniqueIds);
    }

    @Transactional(readOnly = true)
    public List<ChatRoomSummaryResponse> getRoomsByUserId(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findAllVisibleRoomsByUserId(userId);
        return rooms.stream()
                .map(room -> ChatRoomSummaryResponse.builder()
                        .roomId(room.getId())
                        .roomName(room.getRoomName())
                        .type(room.getType())
                        .build())
                .toList();
    }

    @Transactional
    public void inviteToGroupRoom(Long roomId, Long inviteeId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        if (room.getType() != ChatRoomType.GROUP) {
            throw new IllegalArgumentException("그룹 채팅방만 초대할 수 있습니다.");
        }

        boolean alreadyParticipant = room.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(inviteeId));
        if (alreadyParticipant) {
            throw new IllegalArgumentException("이미 참여 중인 사용자입니다.");
        }

        room.getParticipants().add(createParticipant(inviteeId, room));
    }

    @Transactional
    public Long createGroupRoomWithCreator(CreateGroupRoomRequest request, Long creatorId) {
        List<Long> userIds = mergeWithCreator(request.getParticipantIds(), creatorId);
        ChatRoom room = createGroupRoom(request.getRoomName(), userIds);
        return room.getId();
    }

    @Transactional
    public void inviteToGroupRoomWithValidation(Long roomId, Long inviteeId, Long requesterId) {
        authorizationValidator.validateParticipant(roomId, requesterId);
        inviteToGroupRoom(roomId, inviteeId);
    }

    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        if (room.getType() == ChatRoomType.DIRECT) {
            throw new UnsupportedOperationException("1:1 채팅방은 나갈 수 없습니다.");
        }

        ChatRoomParticipant participant = room.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 유저는 채팅방에 속해 있지 않습니다."));

        room.getParticipants().remove(participant);
    }

    @Transactional
    public void hideDirectRoom(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        if (room.getType() != ChatRoomType.DIRECT) {
            throw new IllegalArgumentException("1:1 채팅방이 아닙니다.");
        }

        ChatRoomParticipant participant = room.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("참여자가 아닙니다."));

        participant.setDeleted(true);
    }
}
