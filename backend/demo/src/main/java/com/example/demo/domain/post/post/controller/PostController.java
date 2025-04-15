package com.example.demo.domain.post.post.controller;

import com.example.demo.domain.post.post.controller.dto.*;
import com.example.demo.domain.post.post.service.PostService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 게시글 작성
    @PostMapping
    public ResponseEntity<Long> createPost(
            @RequestBody PostCreateRequest request,
            JwtAuthentication auth
    ) {
        Long postId = postService.createPost(auth.getUserId(), request);
        return ResponseEntity.ok(postId);
    }

    // 게시글 수정
    @PostMapping("/{postId}")
    public ResponseEntity<Void> updatePost(
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request,
            JwtAuthentication auth
    ) {
        postService.updatePost(postId, request, auth.getUserId());
        return ResponseEntity.ok().build();
    }

    // 게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            JwtAuthentication auth
    ) {
        postService.deletePost(postId, auth.getUserId());
        return ResponseEntity.ok().build();
    }

    // 게시글 단건 조회
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long postId,
            JwtAuthentication auth
    ) {
        PostResponse response = postService.getPost(postId, auth.getUserId());
        return ResponseEntity.ok(response);
    }

    // 게시글 전체 조회 (필요시 pagination 가능)
    @GetMapping
    public ResponseEntity<List<PostSummaryResponse>> getAllPosts() {
        List<PostSummaryResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // 게시글 좋아요 토글
    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable Long postId,
            JwtAuthentication auth
    ) {
        LikeResponse response = postService.toggleLike(auth.getUserId(), postId);
        return ResponseEntity.ok(response);
    }
}
