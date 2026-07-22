package com.campus.smart.service;

import com.campus.smart.entity.Notification;
import com.campus.smart.entity.User;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotificationsForUser(String email);
    void createNotification(User user, String title, String message, String category);
    void markAsRead(Long notificationId, String email);
    void markAllAsRead(String email);
}
