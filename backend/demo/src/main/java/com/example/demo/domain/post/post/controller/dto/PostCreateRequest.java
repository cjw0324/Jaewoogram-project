package com.example.demo.domain.post.post.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class PostCreateRequest {
    private String title;
    private String content;
    private List<String> imageUrls;
}
