package com.example.demo.domain.post.post.entity;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.post.comment.entity.Comment;
import com.example.demo.domain.post.like.entity.PostLike;
import com.example.demo.domain.post.post.controller.dto.EditPostRequestDto;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    @Setter
    @Column(name = "title", nullable = false)
    private String title;

    @Setter
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Setter
    @ManyToOne
    @JoinColumn(name = "author", nullable = false)
    private User author;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "post", fetch = FetchType.EAGER, cascade = CascadeType.REMOVE, orphanRemoval = true)
    @OrderBy("id asc")
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<PostLike> likes = new ArrayList<>();

    @Setter
    @Column(name = "like_count")
    private Integer likeCount;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> images = new ArrayList<>();

    public void addImage(PostImage image) {
        images.add(image);
        image.setPost(this);
    }

    public void clearImages() {
        for (PostImage image : images) {
            image.setPost(null);
        }
        images.clear();
    }

    public String getFirstImageUrl() {
        if (images.isEmpty()) {
            return null;
        } else {
            return images.get(0).getImageURL();
        }
    }

    public void update(EditPostRequestDto editPostRequestDto) {
        this.title = editPostRequestDto.getTitle();
        this.content = editPostRequestDto.getContent();
    }
}
