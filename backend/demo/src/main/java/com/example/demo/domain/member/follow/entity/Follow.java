package com.example.demo.domain.member.follow.entity;

import com.example.demo.domain.member.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.query.sql.internal.ParameterRecognizerImpl;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "follow", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
@EntityListeners(AuditingEntityListener.class)
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 팔로우 요청한 유저
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    // 팔로우 당한 유저
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime followedAt;

    @Setter
    @Column(nullable = false)
    private boolean approved = false; // 비공계 계정이면, false 로 시작하고, 공계 계정이면 true 로 바로 팔로우 설정함.


    public Follow(User follower, User following) {
        this.follower = follower;
        this.following = following;
    }
}
