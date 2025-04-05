package com.example.demo.domain.user.entity;

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

    public User(String email,String nickname, UserRole role) {
        this.email = email;
        this.nickname = nickname;
        this.userRole = role;
    }
}
