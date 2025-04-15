package com.example.demo.domain.post.comment.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentLikeResponse {
    private Long commentId;
    private Integer likeCount;
    private String message;  // 좋아요 추가 or 좋아요 취소
}
