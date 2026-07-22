package com.campus.smart.service.impl;

import com.campus.smart.entity.Notification;
import com.campus.smart.entity.User;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.exception.UnauthorizedException;
import com.campus.smart.repository.NotificationRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Notification> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return notificationRepository.findByUserIdOrderByCreatedDateDesc(user.getId());
    }

    @Override
    @Transactional
    public void createNotification(User user, String title, String message, String category) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .category(category != null ? category : "INFO")
                .read(false)
                .createdDate(LocalDateTime.now())
                .user(user)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to access this notification.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedDateDesc(user.getId());
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
}
