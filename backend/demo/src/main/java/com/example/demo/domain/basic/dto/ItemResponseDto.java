package com.example.demo.domain.basic.dto;

import lombok.Data;

@Data
public class ItemResponseDto {
    private Long itemId;
    private String itemName;
    private Long likeCount;
}