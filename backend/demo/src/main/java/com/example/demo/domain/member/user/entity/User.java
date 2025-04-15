package com.example.demo.domain.member.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String email;

    @Setter
    private String nickname;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    @Column(nullable = false)
    private boolean isPrivate = false; // 기본은 공개 계정으로 설정함.

    @Setter
    private String bio = "";

    public User(String email,String nickname, UserRole role) {
        this.email = email;
        this.nickname = nickname;
        this.userRole = role;
    }

    public boolean setPrivate() {
        isPrivate = !isPrivate;
        return isPrivate;
    }

    public User(String nickname) {
        this.email = "@.com";
        this.userRole = UserRole.USER;
        this.isPrivate = false;
        this.bio = "";
        this.nickname = nickname;
    }
}
