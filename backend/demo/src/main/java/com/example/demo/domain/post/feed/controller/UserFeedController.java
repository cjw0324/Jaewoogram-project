package com.example.demo.domain.post.feed.controller;

import com.example.demo.domain.post.feed.controller.dto.UserFeedResponse;
import com.example.demo.domain.post.feed.service.UserFeedService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/feed")
@RequiredArgsConstructor
public class UserFeedController {

    private final UserFeedService userFeedService;

    @GetMapping
    public ResponseEntity<List<UserFeedResponse>> showFeed(JwtAuthentication auth) {
        return ResponseEntity.ok(userFeedService.userFeedList(auth.getUserId()));
    }
}
