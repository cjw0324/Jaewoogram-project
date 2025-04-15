package com.example.demo.domain.post.post.service;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.post.like.repository.PostLikeRepository;
import com.example.demo.domain.post.like.service.PostLikeTransaction;
import com.example.demo.domain.post.post.controller.dto.*;
import com.example.demo.domain.post.post.entity.Post;
import com.example.demo.domain.post.post.entity.PostImage;
import com.example.demo.domain.post.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeTransaction postLikeTransaction;
    private final RedissonClient redissonClient;
    private final PostLikeRepository likeRepository;

    @Transactional
    public Long createPost(Long userId, PostCreateRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Post.builder()
                .title(request.getTitle())
                .build();

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthor(author);
        post.setLikeCount(0);

        for (String url : request.getImageUrls()) {
            PostImage image = new PostImage();
            image.setImageURL(url);
            post.addImage(image);
        }

        Post saved = postRepository.save(post);
        return saved.getPostId();
    }

    @Transactional
    public void updatePost(Long postId, PostUpdateRequest request, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("게시글 수정 권한이 없습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        post.clearImages(); // 기존 이미지 제거
        for (String url : request.getImageUrls()) {
            PostImage image = new PostImage();
            image.setImageURL(url);
            post.addImage(image);
        }

    }

    public PostResponse getPost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        boolean liked = userId != null &&
                likeRepository.existsByPostPostIdAndUserId(postId, userId);

        String redisKey = "post:like:" + postId;
        long likeCount = redissonClient.getAtomicLong(redisKey).isExists()
                ? redissonClient.getAtomicLong(redisKey).get()
                : post.getLikeCount().longValue();

        return new PostResponse(post, (int) likeCount, liked, userId);
    }

    public LikeResponse toggleLike(Long userId, Long postId) {
        String lockKey = "lock:post:like:" + postId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            if (lock.tryLock(3, 1, TimeUnit.SECONDS)) {
                return postLikeTransaction.toggle(userId, postId);
            } else {
                throw new RuntimeException("잠시 후 다시 시도해주세요.");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("락 획득 중 인터럽트 발생");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("게시글을 삭제할 권한이 없습니다.");
        }

        postRepository.delete(post);
    }

    public List<PostSummaryResponse> getAllPosts() {
        List<Post> posts = postRepository.findAll(); // 정렬 필요 시 .findAllByOrderByUpdatedAtDesc() 등으로 확장 가능

        return posts.stream()
                .map(post -> PostSummaryResponse.builder()
                        .id(post.getPostId())
                        .title(post.getTitle())
                        .authorNickname(post.getAuthor().getNickname())
                        .createdAt(post.getUpdatedAt()) // createdAt 없다면 updatedAt으로 대체
                        .likeCount(post.getLikeCount())
                        .thumbnailUrls(
                                post.getImages().stream()
                                        .map(PostImage::getImageURL)
                                        .limit(1) // 썸네일용 첫 이미지
                                        .toList()
                        )
                        .build())
                .toList();
    }

}
