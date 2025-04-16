package com.example.demo.domain.notice.repository;

import com.example.demo.domain.notice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

}
