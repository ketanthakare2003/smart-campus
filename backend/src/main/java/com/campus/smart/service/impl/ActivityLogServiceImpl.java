package com.campus.smart.service.impl;

import com.campus.smart.entity.ActivityLog;
import com.campus.smart.entity.User;
import com.campus.smart.repository.ActivityLogRepository;
import com.campus.smart.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    public Page<ActivityLog> getLogs(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("ALL")) {
            return activityLogRepository.findAllByOrderByCreatedDateDesc(pageable);
        }
        return activityLogRepository.findByCategoryOrderByCreatedDateDesc(category, pageable);
    }

    @Override
    @Transactional
    public void logActivity(User user, String action, String category, String details) {
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .category(category != null ? category.toUpperCase() : "SYSTEM")
                .details(details != null ? details : "")
                .createdDate(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }
}
