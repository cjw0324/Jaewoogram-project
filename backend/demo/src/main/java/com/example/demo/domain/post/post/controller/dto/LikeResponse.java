package com.example.demo.domain.post.post.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponse {
    private Long postId;
    private Integer likeCount;
    private String message;  // "좋아요 추가" or "좋아요 취소"
}
