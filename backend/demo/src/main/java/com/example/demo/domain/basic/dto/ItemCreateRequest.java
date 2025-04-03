package com.example.demo.domain.basic.dto;

import lombok.Data;
import java.util.List;

@Data
public class ItemCreateRequest {
    private String itemName;
    private List<String> imageUrls;
}
