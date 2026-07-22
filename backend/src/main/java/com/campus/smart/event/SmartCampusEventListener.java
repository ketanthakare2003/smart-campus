package com.campus.smart.event;

import com.campus.smart.service.ActivityLogService;
import com.campus.smart.service.EmailService;
import com.campus.smart.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class SmartCampusEventListener implements ApplicationListener<SmartCampusEvent> {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private EmailService emailService;

    @Override
    public void onApplicationEvent(SmartCampusEvent event) {
        try {
            // 1. Log Activity
            if (event.getAction() != null) {
                activityLogService.logActivity(event.getUser(), event.getAction(), event.getCategory(), event.getDetails());
            }

            // 2. Create Notification
            if (event.getUser() != null && event.getAction() != null) {
                notificationService.createNotification(
                        event.getUser(),
                        event.getAction(),
                        event.getDetails(),
                        event.getCategory()
                );
            }

            // 3. Send Email
            if (event.getUser() != null && event.getEmailSubject() != null && event.getEmailBody() != null) {
                emailService.sendHtmlEmail(event.getUser().getEmail(), event.getEmailSubject(), event.getEmailBody());
            }
        } catch (Exception e) {
            System.err.println("Error processing campus event listener: " + e.getMessage());
        }
    }
}
