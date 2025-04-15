package com.example.demo.domain.post.post.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostUpdateRequest {
    private String title;
    private String content;
    private List<String> imageUrls;
}
