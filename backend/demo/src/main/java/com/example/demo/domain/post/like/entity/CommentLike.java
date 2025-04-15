package com.example.demo.domain.post.like.entity;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.post.comment.entity.Comment;
import com.example.demo.domain.post.post.entity.Post;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@Entity
@AllArgsConstructor
@NoArgsConstructor
public class CommentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "comment_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_commentlike_comment_id", foreignKeyDefinition = "FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE"))
    private Comment comment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
