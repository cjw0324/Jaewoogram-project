package com.example.demo.domain.basic.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MainResponseDto {
    private String message;
    private String version;
    private String timestamp;
}
