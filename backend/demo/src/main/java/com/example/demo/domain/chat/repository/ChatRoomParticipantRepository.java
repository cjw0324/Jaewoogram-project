package com.example.demo.domain.chat.repository;

import com.example.demo.domain.chat.entity.ChatRoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomParticipantRepository extends JpaRepository<ChatRoomParticipant, Long> {
    Optional<ChatRoomParticipant> findByRoomIdAndUserId(Long roomId, Long userId);

}
