package com.example.demo.domain.basic.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ItemImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long image_id;

    private String imageURL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
}