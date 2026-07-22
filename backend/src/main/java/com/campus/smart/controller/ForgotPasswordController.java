package com.campus.smart.controller;

import com.campus.smart.service.ForgotPasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    @Autowired
    private ForgotPasswordService forgotPasswordService;

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        forgotPasswordService.sendResetToken(email);
        return ResponseEntity.ok(Map.of("message", "Password reset instructions sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        forgotPasswordService.resetPassword(token, password);
        return ResponseEntity.ok(Map.of("message", "Password has been successfully updated."));
    }
}
