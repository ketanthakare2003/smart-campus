package com.campus.smart.service.impl;

import com.campus.smart.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        System.out.println("[EMAIL LOG] To: " + to + " | Subject: " + subject + " | Body: " + body);
        try {
            if (mailSender == null) {
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        System.out.println("[HTML EMAIL LOG] To: " + to + " | Subject: " + subject);
        if (htmlContent.contains("href=\"")) {
            int startIdx = htmlContent.indexOf("href=\"") + 6;
            int endIdx = htmlContent.indexOf("\"", startIdx);
            if (startIdx > 5 && endIdx > startIdx) {
                System.out.println("[LINK EXTRACTED FOR LOCAL TESTING] " + htmlContent.substring(startIdx, endIdx));
            }
        }
        try {
            if (mailSender == null) {
                return;
            }
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            System.out.println("HTML Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email to " + to + ": " + e.getMessage());
        }
    }
}
