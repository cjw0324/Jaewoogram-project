package com.example.demo.domain.member.user.repository;

import com.example.demo.domain.member.user.entity.UserDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserMongoRepository extends MongoRepository<UserDocument, String> {
    List<UserDocument> findByNicknameContaining(String nickname);
}
