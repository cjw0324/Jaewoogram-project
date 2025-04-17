package com.example.demo.domain.chat.service;

import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.entity.ChatRoomParticipant;
import com.example.demo.domain.chat.repository.ChatRoomRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
@Transactional
@DisplayName("1:1 채팅방 상태 변화 시나리오 통합 테스트")
class ChatRoomServiceTest {

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    private final Long userA = 1L;
    private final Long userB = 2L;

    @Autowired
    private EntityManager em;

    @Test
    @DisplayName("1. 채팅방 생성 → 숨김 → 복구 → 재숨김 → 재복구 → 정상 작동")
    void directRoomFullLifecycleTest() throws InterruptedException {
        ChatRoom room = chatRoomService.findOrCreateDirectRoom(userA, userB, userB);
        ChatRoomParticipant a = getParticipant(room, userA);
        LocalDateTime firstJoinedAt = a.getJoinedAt();

        chatRoomService.hideDirectRoom(room.getId(), userA);
        Thread.sleep(10);

        em.flush(); // DB에 즉시 반영
        em.clear(); // 캐시 제거하여 다음 조회가 DB에서 이루어지게 함

        ChatRoom roomRecovered1 = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);
        ChatRoomParticipant aRecovered1 = getParticipant(roomRecovered1, userA);
        LocalDateTime joinedAt1 = aRecovered1.getJoinedAt();
        assertThat(joinedAt1).isAfter(firstJoinedAt);

        chatRoomService.hideDirectRoom(roomRecovered1.getId(), userA);
        Thread.sleep(10);

        em.flush();
        em.clear();

        ChatRoom roomRecovered2 = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);
        ChatRoomParticipant aRecovered2 = getParticipant(roomRecovered2, userA);
        LocalDateTime joinedAt2 = aRecovered2.getJoinedAt();
        assertThat(joinedAt2).isAfter(joinedAt1);

        ChatRoomParticipant bStillThere = getParticipant(roomRecovered2, userB);
        assertThat(bStillThere.isDeleted()).isFalse();
    }


    @Test
    @DisplayName("2. A와 B 둘 다 숨긴 경우 → 새 방 생성 후 A 가 B 에게 채팅 시작, B 도 A 와 채팅 시작 테스트")
    void bothUsersLeft_thenNewRoomIsCreated() {
        ChatRoom room = chatRoomService.findOrCreateDirectRoom(userA, userB, userB);
        Long roomId = room.getId();

        chatRoomService.hideDirectRoom(roomId, userA);
        chatRoomService.hideDirectRoom(roomId, userB);

        ChatRoom newRoom = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);
        assertThat(newRoom.getId()).isNotEqualTo(roomId);

        ChatRoom newnewRoom = chatRoomService.findOrCreateDirectRoom(userA, userB, userB);
        assertThat(newRoom.getId()).isEqualTo(newnewRoom.getId());
    }

    @Test
    @DisplayName("3. A, B 둘 다 숨긴 경우 둘 중에 한명이 채팅을 시작하면, 새로운 방이 만들어 진다.")
    void bothABOff_thenAReturns_roomReused() {
        ChatRoom room = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);
        Long roomId = room.getId();
        System.out.println("첫번째 room id : " + roomId);
        chatRoomService.hideDirectRoom(roomId, userB);
        chatRoomService.hideDirectRoom(roomId, userA);

        System.out.println("둘 다 삭제");
        ChatRoom resumed = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);

        assertThat(resumed.getId()).isNotEqualTo(roomId);
        assertThat(getParticipant(room, userA).isDeleted()).isTrue();
        assertThat(getParticipant(room, userB).isDeleted()).isTrue();
        assertThat(getParticipant(resumed, userA).isDeleted()).isFalse();
        assertThat(getParticipant(resumed, userB).isDeleted()).isFalse();
    }

    private ChatRoomParticipant getParticipant(ChatRoom room, Long userId) {
        return room.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("해당 유저가 방에 없음"));
    }

    @Test
    @DisplayName("4. B만 숨긴 경우, A가 다시 시작하면 기존 방 재사용되고 A만 복구됨")
    void onlyBOff_thenAReturns_roomReused() {
        ChatRoom room = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);
        Long roomId = room.getId();

        // ❌ A는 숨기지 않고, B만 숨긴 상태 유지
        chatRoomService.hideDirectRoom(roomId, userB);

        ChatRoom resumed = chatRoomService.findOrCreateDirectRoom(userA, userB, userA);

        assertThat(resumed.getId()).isEqualTo(roomId);
        assertThat(getParticipant(resumed, userA).isDeleted()).isFalse();
        assertThat(getParticipant(resumed, userB).isDeleted()).isTrue(); // ✅ 그대로 숨겨져 있음
    }


}
