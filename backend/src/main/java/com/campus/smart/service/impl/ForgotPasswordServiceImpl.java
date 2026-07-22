package com.campus.smart.service.impl;

import com.campus.smart.entity.PasswordResetToken;
import com.campus.smart.entity.User;
import com.campus.smart.exception.BadRequestException;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.repository.PasswordResetTokenRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.service.EmailService;
import com.campus.smart.service.ForgotPasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void sendResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Clean up any existing token for this user
        tokenRepository.findByUserId(user.getId()).ifPresent(t -> {
            tokenRepository.delete(t);
            tokenRepository.flush();
        });

        // Generate token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .user(user)
                .build();

        tokenRepository.save(resetToken);

        // Build HTML template matching the dark premium theme
        String htmlContent = "<div style=\"font-family: system-ui, -apple-system, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 32px 24px; border-radius: 16px; max-width: 500px; margin: 20px auto; border: 1px solid #1e293b; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);\">" +
                "  <h2 style=\"color: #6366f1; font-size: 20px; font-weight: 850; margin-top: 0; text-align: center; letter-spacing: 0.5px;\">Smart Campus Management</h2>" +
                "  <p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6;\">Hello " + user.getFullName() + ",</p>" +
                "  <p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6;\">We received a request to reset your account password. Click the button below to configure your new secure credentials. This link will expire in 1 hour.</p>" +
                "  <div style=\"margin: 28px 0; text-align: center;\">" +
                "    <a href=\"http://localhost:5173/reset-password?token=" + token + "\" style=\"background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);\">Reset My Password</a>" +
                "  </div>" +
                "  <p style=\"font-size: 12px; color: #64748b; text-align: center; border-t: 1px solid #1e293b; pt: 16px; margin-top: 24px;\">If you did not request this password modification, you can safely ignore this email.</p>" +
                "</div>";

        emailService.sendHtmlEmail(user.getEmail(), "Smart Campus - Password Reset Request", htmlContent);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token."));

        if (LocalDateTime.now().isAfter(resetToken.getExpiryDate())) {
            tokenRepository.delete(resetToken);
            throw new BadRequestException("The password reset link has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete used token
        tokenRepository.delete(resetToken);

        // Send confirmation email
        String htmlContent = "<div style=\"font-family: system-ui, -apple-system, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 32px 24px; border-radius: 16px; max-width: 500px; margin: 20px auto; border: 1px solid #1e293b;\">" +
                "  <h2 style=\"color: #10b981; font-size: 20px; font-weight: 850; margin-top: 0; text-align: center;\">Password Changed Successfully</h2>" +
                "  <p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6;\">Hello " + user.getFullName() + ",</p>" +
                "  <p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6;\">Your password was successfully updated recently. If you initiated this change, no further action is required.</p>" +
                "  <p style=\"font-size: 12px; color: #f43f5e; font-weight: bold;\">If you did not make this change, please contact the campus TPO/Admin immediately to lock your account.</p>" +
                "</div>";

        emailService.sendHtmlEmail(user.getEmail(), "Smart Campus - Password Updated", htmlContent);
    }
}
