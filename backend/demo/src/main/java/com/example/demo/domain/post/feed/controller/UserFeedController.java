package com.example.demo.domain.post.feed.controller;

import com.example.demo.domain.post.feed.controller.dto.UserFeedResponse;
import com.example.demo.domain.post.feed.service.UserFeedService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/feed")
@RequiredArgsConstructor
public class UserFeedController {

    private final UserFeedService userFeedService;

    @GetMapping
    public ResponseEntity<List<UserFeedResponse>> showFeed(@RequestHeader Long showUserId, JwtAuthentication auth) {
        return ResponseEntity.ok(userFeedService.userFeedList(showUserId, auth.getUserId()));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getFeedCount(@RequestHeader Long showUserId) {
        return ResponseEntity.ok(userFeedService.userFeedCount(showUserId));
    }
}
