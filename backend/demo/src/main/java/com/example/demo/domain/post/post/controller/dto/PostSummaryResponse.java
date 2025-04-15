package com.example.demo.domain.post.post.controller.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostSummaryResponse {
    private Long id;
    private String title;
    private String authorNickname;
    private LocalDateTime createdAt;
    private Integer likeCount;
    private List<String> thumbnailUrls; // 첫 번째 이미지 기준
}

