package com.campus.smart.controller;

import com.campus.smart.dto.NoticeDto;
import com.campus.smart.dto.StudentProfileDto;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.repository.StudentProfileRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getFacultyStats() {
        long pending = userRepository.countByRoleAndStatus(Role.STUDENT, UserStatus.PENDING_VERIFICATION);
        long verified = userRepository.countByRoleAndStatus(Role.STUDENT, UserStatus.ACTIVE);
        long total = userRepository.countByRole(Role.STUDENT);

        Map<String, Long> studentsByDept = studentProfileRepository.findAll().stream()
                .filter(s -> s.getDepartment() != null && !s.getDepartment().trim().isEmpty())
                .collect(Collectors.groupingBy(s -> s.getDepartment().toUpperCase(), Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingVerification", pending);
        stats.put("verifiedStudents", verified);
        stats.put("totalStudents", total);
        stats.put("studentsByDept", studentsByDept);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<List<StudentProfileDto>> getAllStudents() {
        List<StudentProfileDto> students = facultyService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/pending")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<List<StudentProfileDto>> getPendingStudents() {
        List<StudentProfileDto> pending = facultyService.getPendingStudents();
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/students/{id}/verify")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<StudentProfileDto> verifyStudent(@PathVariable Long id, @RequestParam String action) {
        StudentProfileDto verified = facultyService.verifyStudent(id, action);
        return ResponseEntity.ok(verified);
    }

    @GetMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<StudentProfileDto> getStudentById(@PathVariable Long id) {
        StudentProfileDto student = facultyService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/students/{id}/cgpa")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<StudentProfileDto> updateStudentCgpa(@PathVariable Long id, @RequestParam Double cgpa) {
        StudentProfileDto updated = facultyService.updateStudentCgpa(id, cgpa);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/notices")
    @PreAuthorize("hasAnyRole('FACULTY', 'TPO', 'ADMIN')")
    public ResponseEntity<NoticeDto> postNotice(Principal principal, @RequestBody NoticeDto noticeDto) {
        NoticeDto posted = facultyService.postNotice(principal.getName(), noticeDto);
        return new ResponseEntity<>(posted, HttpStatus.CREATED);
    }

    @GetMapping("/notices")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NoticeDto>> getAllNotices() {
        List<NoticeDto> notices = facultyService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/notices/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NoticeDto> getNoticeById(@PathVariable Long id) {
        NoticeDto notice = facultyService.getNoticeById(id);
        return ResponseEntity.ok(notice);
    }

    @DeleteMapping("/notices/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        facultyService.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }
}
