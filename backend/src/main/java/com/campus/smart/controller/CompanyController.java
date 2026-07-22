package com.campus.smart.controller;

import com.campus.smart.dto.CompanyProfileDto;
import com.campus.smart.dto.JobApplicationDto;
import com.campus.smart.dto.JobDto;
import com.campus.smart.entity.CompanyProfile;
import com.campus.smart.entity.Job;
import com.campus.smart.entity.JobApplication;
import com.campus.smart.enums.ApplicationStatus;
import com.campus.smart.enums.JobStatus;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.repository.CompanyProfileRepository;
import com.campus.smart.repository.JobApplicationRepository;
import com.campus.smart.repository.JobRepository;
import com.campus.smart.service.CompanyService;
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
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCompanyStats(Principal principal) {
        String email = principal.getName();
        CompanyProfile profile = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "email", email));

        List<Job> companyJobs = jobRepository.findAll().stream()
                .filter(j -> j.getCompany().getId().equals(profile.getId()))
                .collect(Collectors.toList());

        long totalJobs = companyJobs.size();
        long activeJobs = companyJobs.stream().filter(j -> j.getStatus() == JobStatus.OPEN).count();

        List<Long> jobIds = companyJobs.stream().map(Job::getId).collect(Collectors.toList());
        List<JobApplication> applications = jobApplicationRepository.findAll().stream()
                .filter(a -> jobIds.contains(a.getJob().getId()))
                .collect(Collectors.toList());

        long totalApplicants = applications.size();
        long shortlisted = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();
        long selected = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.SELECTED).count();
        long rejected = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();

        double hiringRate = totalApplicants > 0 ? ((double) selected / totalApplicants) * 100 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", totalJobs);
        stats.put("activeJobs", activeJobs);
        stats.put("totalApplicants", totalApplicants);
        stats.put("shortlisted", shortlisted);
        stats.put("selected", selected);
        stats.put("rejected", rejected);
        stats.put("hiringRate", Math.round(hiringRate * 100.0) / 100.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/profile")
    public ResponseEntity<CompanyProfileDto> getProfile(Principal principal) {
        CompanyProfileDto profile = companyService.getProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<CompanyProfileDto> updateProfile(Principal principal, @RequestBody CompanyProfileDto profileDto) {
        CompanyProfileDto updated = companyService.updateProfile(principal.getName(), profileDto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobDto> postJob(Principal principal, @RequestBody JobDto jobDto) {
        JobDto posted = companyService.postJob(principal.getName(), jobDto);
        return new ResponseEntity<>(posted, HttpStatus.CREATED);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobDto>> getMyJobs(Principal principal) {
        List<JobDto> jobs = companyService.getMyJobs(principal.getName());
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<JobDto> updateJobStatus(
            Principal principal,
            @PathVariable Long jobId,
            @RequestParam String status) {
        JobDto updated = companyService.updateJobStatus(jobId, principal.getName(), status);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/applicants")
    public ResponseEntity<List<JobApplicationDto>> getJobApplicants(Principal principal) {
        List<JobApplicationDto> applicants = companyService.getJobApplicants(principal.getName());
        return ResponseEntity.ok(applicants);
    }

    @PutMapping("/applicants/{applicationId}/status")
    public ResponseEntity<JobApplicationDto> updateApplicantStatus(
            Principal principal,
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status) {
        JobApplicationDto updated = companyService.updateApplicantStatus(applicationId, principal.getName(), status);
        return ResponseEntity.ok(updated);
    }
}
