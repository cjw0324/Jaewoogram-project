package com.example.demo.domain.post.post.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EditPostRequestDto {
    private String title;
    private String content;
}
