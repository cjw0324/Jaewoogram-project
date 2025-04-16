package com.example.demo.domain.notice.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeNotificationMessage {
    private Long receiverId;   // 게시글 작성자
    private Long postId;       // 게시글 ID
    private String senderNickname; // 좋아요 누른 사람 닉네임
}
