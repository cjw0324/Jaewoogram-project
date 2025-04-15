package com.example.demo.domain.member.user.entity;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Document(collection = "user")
public class UserDocument {
    @Id
    private String id;
    private String nickname;

    public UserDocument(String id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }

    public static UserDocument from(User user) {
        return new UserDocument(user.getId().toString(), user.getNickname().toLowerCase());
    }
}