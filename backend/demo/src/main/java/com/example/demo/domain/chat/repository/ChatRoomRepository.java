package com.example.demo.domain.chat.repository;

import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.entity.ChatRoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("""
        SELECT r FROM ChatRoom r
        JOIN r.participants p
        WHERE p.userId = :userId AND p.deleted = false
    """)
    List<ChatRoom> findAllVisibleRoomsByUserId(Long userId);

    @Query("""
    SELECT r FROM ChatRoom r
    JOIN r.participants p1 ON p1.room = r AND p1.userId = :userId1
    JOIN r.participants p2 ON p2.room = r AND p2.userId = :userId2
    WHERE r.type = :type
""")
    List<ChatRoom> findAllDirectChatRooms(Long userId1, Long userId2, ChatRoomType type);


    @Query("SELECT cr FROM ChatRoom cr LEFT JOIN FETCH cr.participants WHERE cr.id = :roomId")
    Optional<ChatRoom> findWithParticipantsById(@Param("roomId") Long roomId);


}

