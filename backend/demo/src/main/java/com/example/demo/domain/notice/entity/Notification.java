package com.example.demo.domain.notice.entity;
import com.example.demo.domain.notice.message.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long receiverId;
    private Long senderId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String senderNickname;

    @Column(columnDefinition = "JSON")
    private String data; // JSON 형태로 postId, commentId 등

    private boolean isRead;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public void markAsRead() {
        this.isRead = true;
    }
}