package com.campus.smart.controller;

import com.campus.smart.dto.RegistrationCodeDto;
import com.campus.smart.dto.RegistrationCodeRequest;
import com.campus.smart.dto.UserDto;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.repository.*;
import com.campus.smart.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalFaculty = userRepository.countByRole(Role.FACULTY);
        long totalCompanies = userRepository.countByRole(Role.COMPANY);
        long totalJobs = jobRepository.count();
        long totalApplications = jobApplicationRepository.count();
        long totalDrives = placementDriveRepository.count();
        long totalNotices = noticeRepository.count();

        long verifiedStudents = userRepository.countByRoleAndStatus(Role.STUDENT, UserStatus.ACTIVE);
        long pendingStudents = userRepository.countByRoleAndStatus(Role.STUDENT, UserStatus.PENDING_VERIFICATION);
        long activeCompanies = userRepository.countByRoleAndStatus(Role.COMPANY, UserStatus.ACTIVE);

        stats.put("totalStudents", totalStudents);
        stats.put("totalFaculty", totalFaculty);
        stats.put("totalCompanies", totalCompanies);
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("totalDrives", totalDrives);
        stats.put("totalNotices", totalNotices);
        stats.put("verifiedStudents", verifiedStudents);
        stats.put("pendingStudents", pendingStudents);
        stats.put("activeCompanies", activeCompanies);

        // Chart: Students by Department
        Map<String, Long> studentsByDept = studentProfileRepository.findAll().stream()
                .filter(s -> s.getDepartment() != null && !s.getDepartment().trim().isEmpty())
                .collect(Collectors.groupingBy(s -> s.getDepartment().toUpperCase(), Collectors.counting()));
        stats.put("studentsByDept", studentsByDept);

        // Chart: Placement rate (Percentage of students selected out of total applications)
        long selectedApplications = jobApplicationRepository.findAll().stream()
                .filter(a -> a.getStatus().name().equals("SELECTED")).count();
        double placementRate = totalStudents > 0 ? ((double) selectedApplications / totalStudents) * 100 : 0.0;
        stats.put("placementRate", Math.round(placementRate * 100.0) / 100.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = adminService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        UserDto updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        UserDto updated = adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/codes")
    public ResponseEntity<RegistrationCodeDto> generateRegistrationCode(
            Principal principal,
            @Valid @RequestBody RegistrationCodeRequest request) {
        RegistrationCodeDto code = adminService.generateCode(principal.getName(), request);
        return new ResponseEntity<>(code, HttpStatus.CREATED);
    }

    @GetMapping("/codes")
    public ResponseEntity<?> getGeneratedCodes(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "ALL") String role,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        if (page == null || size == null) {
            List<RegistrationCodeDto> codes = adminService.getGeneratedCodes();
            return ResponseEntity.ok(codes);
        }
        
        Page<RegistrationCodeDto> paginated = adminService.getGeneratedCodesPaginated(
                page, size, search, role, status, sortBy, sortDir);
        return ResponseEntity.ok(paginated);
    }

    @PutMapping("/codes/{id}/revoke")
    public ResponseEntity<RegistrationCodeDto> revokeCode(@PathVariable Long id) {
        RegistrationCodeDto revoked = adminService.revokeCode(id);
        return ResponseEntity.ok(revoked);
    }
}
