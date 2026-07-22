package com.campus.smart.service;

import com.campus.smart.entity.ActivityLog;
import com.campus.smart.entity.User;
import org.springframework.data.domain.Page;

public interface ActivityLogService {
    Page<ActivityLog> getLogs(String category, int page, int size);
    void logActivity(User user, String action, String category, String details);
}
