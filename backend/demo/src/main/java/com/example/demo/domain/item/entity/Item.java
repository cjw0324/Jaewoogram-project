package com.example.demo.domain.item.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long item_id;


    private String item_name;

    private Long like_count;

    private String imageUrl;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemImage> images = new ArrayList<>();

    public void addImage(ItemImage image) {
        images.add(image);
        image.setItem(this);
    }

    public void clearImages() {
        for (ItemImage image : images) {
            image.setItem(null);
        }
        images.clear();
    }

}
