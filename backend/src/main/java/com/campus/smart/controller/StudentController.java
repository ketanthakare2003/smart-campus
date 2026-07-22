package com.campus.smart.controller;

import com.campus.smart.dto.JobApplicationDto;
import com.campus.smart.dto.JobDto;
import com.campus.smart.dto.StudentProfileDto;
import com.campus.smart.repository.NoticeRepository;
import com.campus.smart.repository.PlacementDriveRepository;
import com.campus.smart.service.StudentService;
import com.campus.smart.enums.ApplicationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStudentStats(Principal principal) {
        String email = principal.getName();
        List<JobApplicationDto> apps = studentService.getMyApplications(email);
        List<JobDto> jobs = studentService.getAllJobs(email);
        StudentProfileDto profile = studentService.getProfile(email);

        long appliedCount = apps.size();
        long eligibleCount = jobs.stream().filter(JobDto::isEligible).count();
        long drivesCount = placementDriveRepository.count();
        long noticesCount = noticeRepository.count();

        // Calculate profile completion
        int completion = 0;
        if (profile.getRollNumber() != null && !profile.getRollNumber().isEmpty()) completion += 20;
        if (profile.getDepartment() != null && !profile.getDepartment().isEmpty()) completion += 20;
        if (profile.getCgpa() != null && profile.getCgpa() > 0.0) completion += 20;
        if (profile.getGraduationBatch() != null) completion += 20;
        if (profile.getResumeUrl() != null && !profile.getResumeUrl().isEmpty()) completion += 20;

        // Current status
        String status = "PENDING_VERIFICATION";
        if (profile.getUser() != null && profile.getUser().getStatus() != null) {
            status = profile.getUser().getStatus().name();
        }
        boolean hasSelected = apps.stream().anyMatch(a -> a.getStatus() == ApplicationStatus.SELECTED);
        boolean hasShortlisted = apps.stream().anyMatch(a -> a.getStatus() == ApplicationStatus.SHORTLISTED);

        if (hasSelected) {
            status = "SELECTED";
        } else if (hasShortlisted) {
            status = "SHORTLISTED";
        } else if (appliedCount > 0) {
            status = "APPLIED";
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("applied", appliedCount);
        stats.put("eligible", eligibleCount);
        stats.put("drives", drivesCount);
        stats.put("notices", noticesCount);
        stats.put("completion", completion);
        stats.put("status", status);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileDto> getProfile(Principal principal) {
        StudentProfileDto profile = studentService.getProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfileDto> updateProfile(Principal principal, @RequestBody StudentProfileDto profileDto) {
        StudentProfileDto updatedProfile = studentService.updateProfile(principal.getName(), profileDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobDto>> getAllJobs(Principal principal) {
        List<JobDto> jobs = studentService.getAllJobs(principal.getName());
        return ResponseEntity.ok(jobs);
    }

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<JobApplicationDto> applyForJob(
            Principal principal,
            @PathVariable Long jobId,
            @RequestParam(required = false) String resumeUrl) {
        JobApplicationDto application = studentService.applyForJob(principal.getName(), jobId, resumeUrl);
        return ResponseEntity.ok(application);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplicationDto>> getMyApplications(Principal principal) {
        List<JobApplicationDto> applications = studentService.getMyApplications(principal.getName());
        return ResponseEntity.ok(applications);
    }
}
