package com.example.demo.domain.member.follow.controller;


import com.example.demo.domain.member.follow.controller.dto.*;
import com.example.demo.domain.member.follow.service.FollowService;
import com.example.demo.domain.member.user.controller.dto.UserDto;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/follow")
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{followingId}")
    public ResponseEntity<FollowResponseDto> follow(
            @PathVariable Long followingId,
            JwtAuthentication auth
    ) {
        FollowResponseDto result = followService.follow(auth.getUserId(), followingId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{followId}/approve")
    public ResponseEntity<SimpleResponseDto> approveFollow(
            @PathVariable Long followId,
            JwtAuthentication auth
    ) {
        SimpleResponseDto result = followService.approveFollow(followId, auth.getUserId());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/cancel/{followingId}")
    public ResponseEntity<SimpleResponseDto> cancelFollowRequest(
            @PathVariable Long followingId,
            JwtAuthentication auth
    ) {
        SimpleResponseDto result = followService.cancelFollowRequest(auth.getUserId(), followingId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<SimpleResponseDto> unfollow(
            @PathVariable Long followingId,
            JwtAuthentication auth
    ) {
        SimpleResponseDto result = followService.unfollow(auth.getUserId(), followingId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<UserDto>> getPendingRequests(JwtAuthentication auth) {
        return ResponseEntity.ok(followService.getPendingFollowRequests(auth.getUserId()));
    }

    @GetMapping("/requested")
    public ResponseEntity<List<UserDto>> getRequestedFollowings(JwtAuthentication auth) {
        return ResponseEntity.ok(followService.getMyPendingFollowings(auth.getUserId()));
    }

    @GetMapping("/followers")
    public ResponseEntity<FollowListResponseDto> getFollowers(JwtAuthentication auth) {
        return ResponseEntity.ok(followService.getMyFollowers(auth.getUserId()));
    }

    @GetMapping("/followings")
    public ResponseEntity<FollowListResponseDto> getFollowings(JwtAuthentication auth) {
        return ResponseEntity.ok(followService.getMyFollowings(auth.getUserId()));
    }

    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<FollowStatusResponseDto> getFollowStatus(
            @PathVariable Long targetUserId,
            JwtAuthentication auth
    ) {
        FollowStatusResponseDto result = followService.getFollowStatus(auth.getUserId(), targetUserId);
        return ResponseEntity.ok(result);
    }

}
