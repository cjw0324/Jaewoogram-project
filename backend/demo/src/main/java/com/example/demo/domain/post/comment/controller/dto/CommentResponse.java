package com.example.demo.domain.post.comment.controller.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentResponse {
    private Long commentId;
    private String comment;
    private Long authorId;
    private String authorNickname;
    private LocalDateTime modifiedAt;
    private Boolean likedByCurrentUser;
    private Integer likeCount;
    private List<CommentResponse> children; // 대댓글 목록 (재귀 구조)
    private Boolean isAuthor;
}
