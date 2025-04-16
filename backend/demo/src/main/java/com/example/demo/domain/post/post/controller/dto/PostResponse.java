package com.example.demo.domain.post.post.controller.dto;

import com.example.demo.domain.post.post.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorNickname;
    private LocalDateTime updatedAt;
    private Integer likeCount;
    private Boolean likedByCurrentUser;
    private List<String> imageUrls;
    private Boolean isAuthor;

    public PostResponse(Post post, int likeCount, boolean liked, Long userId) {
        this.id = post.getPostId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorId = post.getAuthor().getId();
        this.authorNickname = post.getAuthor().getNickname();
        this.updatedAt = post.getUpdatedAt();
        this.likeCount = likeCount;
        this.likedByCurrentUser = liked;
        this.imageUrls = post.getImages().stream()
                .map(image -> image.getImageURL())
                .toList();
        this.isAuthor = post.getAuthor().getId().equals(userId);
    }
}

