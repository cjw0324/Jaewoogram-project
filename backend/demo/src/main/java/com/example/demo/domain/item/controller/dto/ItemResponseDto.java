package com.example.demo.domain.item.controller.dto;

import lombok.Data;
import java.util.List;

@Data
public class ItemResponseDto {
    private Long itemId;
    private String itemName;
    private Long likeCount;
    private List<String> imageUrls;
}