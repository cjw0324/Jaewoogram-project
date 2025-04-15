//package com.example.demo.global.user.init;
//
//import com.example.demo.domain.member.user.entity.User;
//import com.example.demo.domain.member.user.entity.UserDocument;
//import com.example.demo.domain.member.user.repository.UserMongoRepository;
//import com.example.demo.domain.member.user.repository.UserRepository;
//import jakarta.annotation.PostConstruct;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.context.annotation.Profile;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//
//@Component
//@Profile("local")
//@RequiredArgsConstructor
//@Slf4j
//public class SyncDb {
//
//    private final UserRepository userRepository;
//    private final UserMongoRepository userMongoRepository;
//
//    @PostConstruct
//    public void syncAllUsersToMongo() {
//        long start = System.currentTimeMillis();
//
//        // 1. MySQL에 더미 유저 생성 (필요 시 중복 방지)
//        if (userRepository.count() < 10000) {
//            for (int i = 1; i <= 10000; i++) {
//                String nickname = "user" + i;
//                userRepository.save(new User(nickname));
//            }
//            log.info("✅ MySQL 더미 유저 10000건 생성 완료");
//        }
//
//        // 2. MongoDB 동기화
//        List<User> users = userRepository.findAll();
//        List<UserDocument> docs = users.stream()
//                .map(UserDocument::from)  // 여기서 lowercase 처리됨
//                .toList();
//        userMongoRepository.saveAll(docs);
//
//        log.info("✅ MongoDB 동기화 완료 ( {} 건 )", docs.size());
//        log.info("⏱️ 소요 시간: {}ms", System.currentTimeMillis() - start);
//    }
//
//
//
////    @PostConstruct
////    public void syncAllUsersToMongo() {
////        List<User> users = userRepository.findAll();
////        List<UserDocument> docs = users.stream()
////                .map(UserDocument::from)
////                .toList();
////        userMongoRepository.saveAll(docs);
////        log.info("MongoDB 동기화 완료 ( {} ) 건", docs.size());
////    }
//
//}
