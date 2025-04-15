package com.example.demo.domain.post.comment.controller;

import com.example.demo.domain.post.comment.service.CommentService;
import com.example.demo.domain.post.like.service.CommentLikeService;
import com.example.demo.domain.post.comment.controller.dto.CommentCreateRequest;
import com.example.demo.domain.post.comment.controller.dto.CommentLikeResponse;
import com.example.demo.domain.post.comment.controller.dto.CommentResponse;
import com.example.demo.domain.post.comment.controller.dto.CommentUpdateRequest;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentLikeService commentLikeService;
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Long> createComment(
            @RequestBody CommentCreateRequest request,
            JwtAuthentication auth
    ) {
        return ResponseEntity.ok(commentService.createComment(auth.getUserId(), request));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long postId,
            JwtAuthentication auth
    ) {
        return ResponseEntity.ok(commentService.getComments(postId, auth.getUserId()));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Void> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest request,
            JwtAuthentication auth
    ) {
        commentService.updateComment(auth.getUserId(), commentId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            JwtAuthentication auth
    ) {
        commentService.deleteComment(auth.getUserId(), commentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<CommentLikeResponse> toggleLike(
            @PathVariable Long commentId,
            JwtAuthentication auth
    ) {
        CommentLikeResponse response = commentLikeService.toggleLike(auth.getUserId(), commentId);
        return ResponseEntity.ok(response);
    }
}
