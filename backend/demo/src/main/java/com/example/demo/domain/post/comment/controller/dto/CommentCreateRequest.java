package com.example.demo.domain.post.comment.controller.dto;

import lombok.Data;

@Data
public class CommentCreateRequest {
    private Long postId;       // 어떤 게시글에 댓글을 달지
    private String content;    // 댓글 내용
    private Long parentId;     // 대댓글일 경우 부모 댓글 ID (일반 댓글이면 null)
}

