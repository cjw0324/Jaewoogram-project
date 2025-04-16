package com.example.demo.domain.notice.controller;

import com.example.demo.domain.notice.entity.Notification;
import com.example.demo.domain.notice.repository.NotificationRepository;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    // 1. 안 읽은 알림 목록 조회
    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications(JwtAuthentication auth) {
        return notificationRepository.findAllByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(auth.getUserId());
    }

    // 2. 단일 알림 읽음 처리
    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("알림 없음"));
        n.markAsRead(); // isRead = true
        notificationRepository.save(n);
    }

    // (선택) 3. 모든 알림 읽음 처리
    @PatchMapping("/read-all")
    public void markAllAsRead(JwtAuthentication auth) {
        List<Notification> unread = notificationRepository.findAllByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(auth.getUserId());
        unread.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unread);
    }
}
