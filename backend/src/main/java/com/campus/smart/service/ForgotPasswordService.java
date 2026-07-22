package com.campus.smart.service;

public interface ForgotPasswordService {
    void sendResetToken(String email);
    void resetPassword(String token, String newPassword);
}
