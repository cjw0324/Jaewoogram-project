package com.example.demo.domain.post.comment.service;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.post.comment.entity.Comment;
import com.example.demo.domain.post.comment.repository.CommentRepositiory;
import com.example.demo.domain.post.like.repository.CommentLikeRepository;
import com.example.demo.domain.post.comment.controller.dto.CommentCreateRequest;
import com.example.demo.domain.post.comment.controller.dto.CommentResponse;
import com.example.demo.domain.post.comment.controller.dto.CommentUpdateRequest;
import com.example.demo.domain.post.post.entity.Post;
import com.example.demo.domain.post.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepositiory commentRepository;
    private final CommentLikeRepository likeRepository;
    private final RedissonClient redissonClient;

    @Transactional
    public Long createComment(Long userId, CommentCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setComment(request.getContent());
        comment.setParent(
                request.getParentId() != null ?
                        commentRepository.findById(request.getParentId())
                                .orElseThrow(() -> new RuntimeException("부모 댓글 없음")) : null
        );
        commentRepository.save(comment);
        return comment.getId();
    }

    public List<CommentResponse> getComments(Long postId, Long userId) {
        List<Comment> comments = commentRepository.findAllWithChildrenByPostId(postId);
        return comments.stream()
                .filter(c -> c.getParent() == null)
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateComment(Long userId, Long commentId, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("수정 권한 없음");
        }
        comment.update(request.getComment());
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("삭제 권한 없음");
        }
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment, Long userId) {
        boolean liked = userId != null && likeRepository.existsByCommentIdAndUserId(comment.getId(), userId);
        String redisKey = "comment:like:" + comment.getId();
        int likeCount = redissonClient.getAtomicLong(redisKey).isExists()
                ? (int) redissonClient.getAtomicLong(redisKey).get()
                : comment.getLikes().size(); // fallback


        return CommentResponse.builder()
                .commentId(comment.getId())
                .comment(comment.getComment())
                .authorNickname(comment.getAuthor().getNickname())
                .modifiedAt(comment.getModifiedDate())
                .likedByCurrentUser(liked)
                .likeCount(likeCount)
                .children(comment.getChildren().stream()
                        .map(c -> toResponse(c, userId))
                        .collect(Collectors.toList()))
                .isAuthor(comment.getAuthor().getId().equals(userId))
                .build();
    }
}
