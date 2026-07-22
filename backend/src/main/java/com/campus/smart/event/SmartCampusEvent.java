package com.campus.smart.event;

import com.campus.smart.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SmartCampusEvent extends ApplicationEvent {
    private final User user;
    private final String action;
    private final String category;
    private final String details;
    private final String emailSubject;
    private final String emailBody;

    public SmartCampusEvent(Object source, User user, String action, String category, String details, String emailSubject, String emailBody) {
        super(source);
        this.user = user;
        this.action = action;
        this.category = category;
        this.details = details;
        this.emailSubject = emailSubject;
        this.emailBody = emailBody;
    }
}
