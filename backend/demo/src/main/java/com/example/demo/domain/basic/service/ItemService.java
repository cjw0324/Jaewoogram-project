package com.example.demo.domain.basic.service;

import com.example.demo.domain.basic.dto.ItemCreateRequest;
import com.example.demo.domain.basic.dto.ItemRequestDto;
import com.example.demo.domain.basic.dto.ItemResponseDto;
import com.example.demo.domain.basic.entity.Item;
import com.example.demo.domain.basic.entity.ItemImage;
import com.example.demo.domain.basic.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
    private final RedissonClient redissonClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public void likeItem(Long itemId) {
        String lockKey = "lock:item:" + itemId;
        RLock lock = redissonClient.getLock(lockKey);
        try {
            lock.lock(10, TimeUnit.SECONDS);
            String cacheKey = "item:like:" + itemId;
            Long cachedLikeCount = (Long) redisTemplate.opsForValue().get(cacheKey);
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));

            if (cachedLikeCount == null) {
                cachedLikeCount = item.getLike_count();
            }

            cachedLikeCount++;
            redisTemplate.opsForValue().set(cacheKey, cachedLikeCount, 10, TimeUnit.MINUTES);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    public Long getLikeCount(Long itemId) {
        String cacheKey = "item:like:" + itemId;
        Long cachedLikeCount = (Long) redisTemplate.opsForValue().get(cacheKey);
        if (cachedLikeCount == null) {
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
            cachedLikeCount = item.getLike_count();
            redisTemplate.opsForValue().set(cacheKey, cachedLikeCount, 10, TimeUnit.MINUTES);
        }
        return cachedLikeCount;
    }

    @Transactional
    public ItemResponseDto createItem(ItemCreateRequest request) {
        Item item = new Item();
        item.setItem_name(request.getItemName());
        item.setLike_count(0L);

        if (!request.getImageUrls().isEmpty()) {
            item.setImageUrl(request.getImageUrls().get(0));
        }

        for (String url : request.getImageUrls()) {
            ItemImage image = new ItemImage();
            image.setImageURL(url);
            item.addImage(image);
        }

        Item saved = itemRepository.save(item);
        return toDto(saved);
    }

    public List<ItemResponseDto> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ItemResponseDto getItem(Long id) {
        return itemRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
    }

    @Transactional
    public ItemResponseDto updateItem(Long id, ItemRequestDto dto) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        item.setItem_name(dto.getItemName());

        // 대표 이미지 업데이트
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            item.setImageUrl(dto.getImageUrls().get(0));
        } else {
            item.setImageUrl(null);
        }

        // 기존 이미지 비우고 새로 설정
        item.clearImages();

        if (dto.getImageUrls() != null) {
            for (String url : dto.getImageUrls()) {
                ItemImage newImage = new ItemImage();
                newImage.setImageURL(url);
                item.addImage(newImage);
            }
        }

        return toDto(item);
    }

    @Transactional
    public ItemResponseDto deleteItem(Long id) {
        ItemResponseDto deleteItemDto = itemRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        itemRepository.deleteById(deleteItemDto.getItemId());
        return deleteItemDto;
    }

    private ItemResponseDto toDto(Item item) {
        ItemResponseDto dto = new ItemResponseDto();
        dto.setItemId(item.getItem_id());
        dto.setItemName(item.getItem_name());
        dto.setLikeCount(item.getLike_count());

        List<String> imageUrls = item.getImages().stream()
                .map(ItemImage::getImageURL)
                .toList();
        dto.setImageUrls(new ArrayList<>(imageUrls));

        return dto;
    }

    @Scheduled(fixedRate = 300000)
    public void syncLikeCountFromRedisToDb() {
        Set<String> keys = redisTemplate.keys("item:like:*");
        if (keys == null) return;

        for (String key : keys) {
            try {
                Long itemId = Long.parseLong(key.split(":" )[2]);
                Long likeCount = (Long) redisTemplate.opsForValue().get(key);
                if (likeCount != null) {
                    Item item = itemRepository.findById(itemId)
                            .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
                    item.setLike_count(likeCount);
                    itemRepository.save(item);
                }
            } catch (Exception e) {
                System.err.println("Failed to sync like count for key: " + key);
            }
        }
    }
}