package com.campus.smart.service.impl;

import com.campus.smart.event.SmartCampusEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.campus.smart.dto.DtoMapper;
import com.campus.smart.dto.RegistrationCodeDto;
import com.campus.smart.dto.RegistrationCodeRequest;
import com.campus.smart.dto.UserDto;
import com.campus.smart.entity.CompanyProfile;
import com.campus.smart.entity.Job;
import com.campus.smart.entity.JobApplication;
import com.campus.smart.entity.Notice;
import com.campus.smart.entity.RegistrationCode;
import com.campus.smart.entity.StudentProfile;
import com.campus.smart.entity.User;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.exception.BadRequestException;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.repository.CompanyProfileRepository;
import com.campus.smart.repository.JobApplicationRepository;
import com.campus.smart.repository.JobRepository;
import com.campus.smart.repository.NoticeRepository;
import com.campus.smart.repository.RegistrationCodeRepository;
import com.campus.smart.repository.StudentProfileRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.repository.PasswordResetTokenRepository;
import com.campus.smart.repository.NotificationRepository;
import com.campus.smart.repository.ActivityLogRepository;
import com.campus.smart.entity.Notification;
import com.campus.smart.entity.ActivityLog;
import com.campus.smart.entity.PasswordResetToken;
import com.campus.smart.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private RegistrationCodeRepository registrationCodeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(DtoMapper::toUserDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return DtoMapper.toUserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        Role oldRole = user.getRole();
        if (oldRole == role) {
            return DtoMapper.toUserDto(user);
        }

        // Clean up old profiles and posted records recursively to avoid foreign key violations
        cleanUpUserProfiles(user);

        user.setRole(role);
        User saved = userRepository.save(user);

        // Create new profile if switching to student or company
        if (role == Role.STUDENT) {
            if (studentProfileRepository.findByUserId(id).isEmpty()) {
                StudentProfile studentProfile = StudentProfile.builder()
                        .user(saved)
                        .rollNumber(null)
                        .department("")
                        .cgpa(0.0)
                        .skills("")
                        .resumeUrl("")
                        .build();
                studentProfileRepository.save(studentProfile);
            }
        } else if (role == Role.COMPANY) {
            if (companyProfileRepository.findByUserId(id).isEmpty()) {
                CompanyProfile companyProfile = CompanyProfile.builder()
                        .user(saved)
                        .companyName(saved.getFullName() + " Corp")
                        .website("")
                        .description("")
                        .industry("")
                        .build();
                companyProfileRepository.save(companyProfile);
            }
        }

        return DtoMapper.toUserDto(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        // Clean up associated profiles, notices, codes, and references
        cleanUpUserProfiles(user);
        
        userRepository.delete(user);
    }

    private void cleanUpUserProfiles(User user) {
        // Delete notices posted by this user (foreign key reference)
        List<Notice> notices = noticeRepository.findByPostedById(user.getId());
        noticeRepository.deleteAll(notices);

        // Delete registration codes generated by this user (foreign key reference)
        List<RegistrationCode> generatedCodes = registrationCodeRepository.findByGeneratedById(user.getId());
        registrationCodeRepository.deleteAll(generatedCodes);

        // Delete password reset tokens (foreign key reference)
        passwordResetTokenRepository.findByUserId(user.getId()).ifPresent(token -> {
            passwordResetTokenRepository.delete(token);
        });

        // Delete notifications (foreign key reference)
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedDateDesc(user.getId());
        notificationRepository.deleteAll(notifications);

        // Set user to null in activity logs (foreign key reference, preserving audit details)
        List<ActivityLog> logs = activityLogRepository.findByUserId(user.getId());
        for (ActivityLog log : logs) {
            log.setUser(null);
        }
        activityLogRepository.saveAll(logs);

        if (user.getRole() == Role.STUDENT) {
            studentProfileRepository.findByUserId(user.getId()).ifPresent(studentProfile -> {
                // Delete job applications first (foreign key reference)
                List<JobApplication> applications = jobApplicationRepository.findByStudentId(studentProfile.getId());
                jobApplicationRepository.deleteAll(applications);
                
                // Now safe to delete the student profile
                studentProfileRepository.delete(studentProfile);
            });
        } else if (user.getRole() == Role.COMPANY) {
            companyProfileRepository.findByUserId(user.getId()).ifPresent(companyProfile -> {
                // Find all jobs posted by the company
                List<Job> jobs = jobRepository.findByCompanyId(companyProfile.getId());
                for (Job job : jobs) {
                    // Delete job applications for each job
                    List<JobApplication> applications = jobApplicationRepository.findByJobId(job.getId());
                    jobApplicationRepository.deleteAll(applications);
                }
                // Delete all jobs
                jobRepository.deleteAll(jobs);
                
                // Now safe to delete company profile
                companyProfileRepository.delete(companyProfile);
            });
        }
    }

    @Override
    @Transactional
    public RegistrationCodeDto generateCode(String adminEmail, RegistrationCodeRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", adminEmail));

        if (request.getTargetRole() == Role.ADMIN || request.getTargetRole() == Role.STUDENT) {
            throw new BadRequestException("Error: Cannot generate codes for ADMIN or STUDENT roles.");
        }

        String randomCode = (request.getTargetRole().name().charAt(0)) + "-" + 
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        RegistrationCode registrationCode = RegistrationCode.builder()
                .code(randomCode)
                .targetRole(request.getTargetRole())
                .used(false)
                .expiresAt(LocalDateTime.now().plusHours(request.getExpirationHours()))
                .generatedBy(admin)
                .build();

        RegistrationCode saved = registrationCodeRepository.save(registrationCode);
        eventPublisher.publishEvent(new SmartCampusEvent(this, admin, "Registration Code Generated", "ADMIN", "Generated signup code: " + randomCode + " for role " + request.getTargetRole(), "Smart Campus - Registration Code Created", "<h2>Registration Code Generated</h2><p>A new registration code has been generated by administrator:</p><p><b>Code:</b> " + randomCode + "<br><b>Target Role:</b> " + request.getTargetRole() + "</p>"));
        return DtoMapper.toRegistrationCodeDto(saved);
    }

    @Override
    public List<RegistrationCodeDto> getGeneratedCodes() {
        return registrationCodeRepository.findAllByOrderByExpiresAtDesc().stream()
                .map(DtoMapper::toRegistrationCodeDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setStatus(status);
        User saved = userRepository.save(user);
        eventPublisher.publishEvent(new SmartCampusEvent(this, saved, "Account Status Updated", "SECURITY", "Your campus registration has been " + status, "Smart Campus - Account Status Verification", "<h2>Account Status Update</h2><p>Your registration status has been updated to: <b>" + status + "</b></p>"));
        return DtoMapper.toUserDto(saved);
    }

    @Override
    public Page<RegistrationCodeDto> getGeneratedCodesPaginated(
            int page, int size, String search, String role, String status, String sortBy, String sortDir) {
        
        List<RegistrationCode> allCodes = registrationCodeRepository.findAll();
        
        // 1. Filter
        List<RegistrationCode> filteredList = allCodes.stream()
                .filter(code -> {
                    String sLower = search.trim().toLowerCase();
                    return sLower.isEmpty() || code.getCode().toLowerCase().contains(sLower);
                })
                .filter(code -> role.equalsIgnoreCase("ALL") || code.getTargetRole().name().equalsIgnoreCase(role))
                .filter(code -> {
                    if (status.equalsIgnoreCase("ACTIVE")) {
                        return !code.isUsed() && code.getExpiresAt().isAfter(LocalDateTime.now());
                    } else if (status.equalsIgnoreCase("USED")) {
                        return code.isUsed();
                    } else if (status.equalsIgnoreCase("EXPIRED")) {
                        return !code.isUsed() && code.getExpiresAt().isBefore(LocalDateTime.now());
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        // 2. Sort
        java.util.Comparator<RegistrationCode> comparator;
        if ("targetRole".equalsIgnoreCase(sortBy)) {
            comparator = java.util.Comparator.comparing(c -> c.getTargetRole().name());
        } else if ("expiresAt".equalsIgnoreCase(sortBy)) {
            comparator = java.util.Comparator.comparing(RegistrationCode::getExpiresAt);
        } else if ("used".equalsIgnoreCase(sortBy) || "status".equalsIgnoreCase(sortBy)) {
            comparator = java.util.Comparator.comparing(RegistrationCode::isUsed);
        } else {
            // Default createdDate, null-safe fallback
            comparator = java.util.Comparator.comparing(c -> c.getCreatedDate() != null ? c.getCreatedDate() : LocalDateTime.MIN);
        }
        
        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }
        
        filteredList.sort(comparator);
        
        // 3. Paginate
        int total = filteredList.size();
        int start = page * size;
        int end = Math.min(start + size, total);
        
        List<RegistrationCodeDto> pagedContent = new java.util.ArrayList<>();
        if (start < total) {
            pagedContent = filteredList.subList(start, end).stream()
                    .map(DtoMapper::toRegistrationCodeDto)
                    .collect(Collectors.toList());
        }
        
        return new PageImpl<>(pagedContent, PageRequest.of(page, size), total);
    }

    @Override
    @Transactional
    public RegistrationCodeDto revokeCode(Long id) {
        RegistrationCode code = registrationCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RegistrationCode", "id", id));
        
        code.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        RegistrationCode saved = registrationCodeRepository.save(code);
        
        // Log event
        eventPublisher.publishEvent(new SmartCampusEvent(this, code.getGeneratedBy(), "Registration Code Revoked", "ADMIN", "Revoked registration code: " + code.getCode(), "Smart Campus - Registration Code Revoked", "<h2>Registration Code Revoked</h2><p>The following registration code has been revoked and deactivated:</p><p><b>Code:</b> " + code.getCode() + "<br><b>Target Role:</b> " + code.getTargetRole() + "</p>"));
        
        return DtoMapper.toRegistrationCodeDto(saved);
    }
}
