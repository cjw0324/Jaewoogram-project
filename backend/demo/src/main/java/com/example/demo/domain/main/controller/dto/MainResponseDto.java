package com.example.demo.domain.main.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MainResponseDto {
    private String message;
    private String version;
    private String createdAt;
}