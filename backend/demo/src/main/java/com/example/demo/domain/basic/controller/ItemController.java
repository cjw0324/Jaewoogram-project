package com.example.demo.domain.basic.controller;

import com.example.demo.domain.basic.dto.ItemRequestDto;
import com.example.demo.domain.basic.dto.ItemResponseDto;
import com.example.demo.domain.basic.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
public class ItemController {
    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<String> likeItem(@PathVariable("id") Long itemId) {
        itemService.likeItem(itemId);
        return ResponseEntity.ok("Item liked successfully");
    }

    @GetMapping("/{id}/likes")
    public ResponseEntity<Long> getLikeCount(@PathVariable("id") Long itemId) {
        Long likeCount = itemService.getLikeCount(itemId);
        return ResponseEntity.ok(likeCount);
    }

    @PostMapping
    public ResponseEntity<ItemResponseDto> createItem(@RequestBody ItemRequestDto requestDto) {
        ItemResponseDto created = itemService.createItem(requestDto);
        return ResponseEntity
                .status(201)
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDto>> getAllItems() {
        List<ItemResponseDto> items = itemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDto> getItem(@PathVariable Long id) {
        ItemResponseDto item = itemService.getItem(id);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDto> updateItem(@PathVariable Long id, @RequestBody ItemRequestDto requestDto) {
        ItemResponseDto updated = itemService.updateItem(id, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ItemResponseDto> deleteItem(@PathVariable Long id) {
        ItemResponseDto item = itemService.deleteItem(id);
        return ResponseEntity.ok(item);
    }
}
