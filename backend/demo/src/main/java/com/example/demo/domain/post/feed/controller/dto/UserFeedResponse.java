package com.example.demo.domain.post.feed.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserFeedResponse {
    private Long postId;
    private String imageUrl;
}
