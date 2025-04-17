package com.example.demo.domain.chat.repository;

import com.example.demo.domain.chat.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    @Query("""
    SELECT m FROM ChatMessageEntity m
    WHERE m.roomId = :roomId AND m.createdAt > :joinedAt
    ORDER BY m.createdAt ASC
""")
    List<ChatMessageEntity> findMessagesAfterJoinedAt(Long roomId, LocalDateTime joinedAt);

}
