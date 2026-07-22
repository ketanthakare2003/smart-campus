package com.campus.smart.service.impl;

import com.campus.smart.event.SmartCampusEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.campus.smart.dto.*;
import com.campus.smart.entity.*;
import com.campus.smart.enums.*;
import com.campus.smart.exception.BadRequestException;
import com.campus.smart.repository.*;
import com.campus.smart.security.JwtUtils;
import com.campus.smart.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private RegistrationCodeRepository registrationCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public UserDto registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        if (registerRequest.getRole() == Role.ADMIN) {
            throw new BadRequestException("Error: Public registration for ADMIN role is not allowed.");
        }

        UserStatus initialStatus = UserStatus.ACTIVE;

        if (registerRequest.getRole() == Role.STUDENT) {
            initialStatus = UserStatus.PENDING_VERIFICATION;
        } else {
            // Validate code for FACULTY, TPO, COMPANY
            String code = registerRequest.getRegistrationCode();
            if (code == null || code.trim().isEmpty()) {
                throw new BadRequestException("Error: Registration code is required for " + registerRequest.getRole() + " registration.");
            }

            RegistrationCode codeEntity = registrationCodeRepository.findByCode(code.trim())
                    .orElseThrow(() -> new BadRequestException("Error: Invalid registration code."));

            if (codeEntity.isUsed()) {
                throw new BadRequestException("Error: This registration code has already been used.");
            }

            if (codeEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Error: This registration code has expired.");
            }

            if (codeEntity.getTargetRole() != registerRequest.getRole()) {
                throw new BadRequestException("Error: Registration code role mismatch. Expected: " + codeEntity.getTargetRole());
            }

            // Consume code
            codeEntity.setUsed(true);
            registrationCodeRepository.save(codeEntity);

            initialStatus = UserStatus.PENDING_ADMIN_APPROVAL;
        }

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .status(initialStatus)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create profiles based on role
        if (registerRequest.getRole() == Role.STUDENT) {
            StudentProfile studentProfile = StudentProfile.builder()
                    .user(savedUser)
                    .rollNumber(null)
                    .department("")
                    .cgpa(0.0)
                    .skills("")
                    .resumeUrl("")
                    .build();
            studentProfileRepository.save(studentProfile);
        } else if (registerRequest.getRole() == Role.COMPANY) {
            CompanyProfile companyProfile = CompanyProfile.builder()
                    .user(savedUser)
                    .companyName(savedUser.getFullName() + " Corp")
                    .website("")
                    .description("")
                    .industry("")
                    .build();
            companyProfileRepository.save(companyProfile);
        }

        eventPublisher.publishEvent(new SmartCampusEvent(this, savedUser, "User Registered", "ONBOARDING", "Successfully signed up as " + savedUser.getRole(), "Smart Campus - Registration Received", "<h2>Welcome to Smart Campus!</h2><p>Your registration request was successfully received. Current status: <b>" + savedUser.getStatus() + "</b></p>"));

        return DtoMapper.toUserDto(savedUser);
    }

    @Override
    public JwtResponse loginUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Error: Invalid email or password."));

        if (user.getStatus() == UserStatus.REJECTED) {
            throw new BadRequestException("Error: Your registration request was rejected by the administration.");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Error: Your account has been suspended. Please contact support.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new JwtResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus()
        );
    }
}
