package com.example.demo.domain.chat.service;

import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.entity.ChatRoomParticipant;
import com.example.demo.domain.chat.entity.ChatRoomType;
import com.example.demo.domain.chat.repository.ChatRoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


@SpringBootTest
@Transactional
@DisplayName("그룹 채팅방 테스트")
class GroupChatRoomServiceTest {

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    private final Long userA = 1L;
    private final Long userB = 2L;
    private final Long userC = 3L;
    private final Long userD = 4L;

    @Test
    @DisplayName("1. 그룹 채팅방 생성 테스트")
    void createGroupRoom_success() {
        List<Long> participants = List.of(userA, userB, userC);
        ChatRoom room = chatRoomService.createGroupRoom("스터디 모임", participants);

        assertThat(room.getType()).isEqualTo(ChatRoomType.GROUP);
        assertThat(room.getRoomName()).isEqualTo("스터디 모임");
        assertThat(room.getParticipants()).hasSize(3);
    }

    @Test
    @DisplayName("2. 유저 초대 성공")
    void inviteUserToGroupRoom_success() {
        ChatRoom room = chatRoomService.createGroupRoom("그룹채팅", List.of(userA, userB));
        Long roomId = room.getId();

        chatRoomService.inviteToGroupRoom(roomId, userC);

        ChatRoom updatedRoom = chatRoomRepository.findById(roomId).orElseThrow();
        assertThat(updatedRoom.getParticipants()).hasSize(3);
    }

    @Test
    @DisplayName("3. 이미 있는 유저를 초대하려고 하면 예외 발생")
    void inviteExistingUser_fail() {
        ChatRoom room = chatRoomService.createGroupRoom("그룹채팅", List.of(userA, userB));

        assertThatThrownBy(() ->
                chatRoomService.inviteToGroupRoom(room.getId(), userA)
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 참여 중인 사용자입니다.");
    }

    @Test
    @DisplayName("4. 유저 퇴장 테스트")
    void leaveGroupRoom_success() {
        ChatRoom room = chatRoomService.createGroupRoom("그룹채팅", List.of(userA, userB, userC));
        chatRoomService.leaveRoom(room.getId(), userB);

        ChatRoom updatedRoom = chatRoomRepository.findById(room.getId()).orElseThrow();
        List<Long> remainingUserIds = updatedRoom.getParticipants().stream()
                .map(ChatRoomParticipant::getUserId)
                .toList();

        assertThat(remainingUserIds).containsExactlyInAnyOrder(userA, userC);
    }

    @Test
    @DisplayName("5. 비참여자가 퇴장 시도하면 예외")
    void leaveByNonParticipant_fail() {
        ChatRoom room = chatRoomService.createGroupRoom("그룹채팅", List.of(userA, userB));

        assertThatThrownBy(() ->
                chatRoomService.leaveRoom(room.getId(), userD)
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("해당 유저는 채팅방에 속해 있지 않습니다.");
    }
}
