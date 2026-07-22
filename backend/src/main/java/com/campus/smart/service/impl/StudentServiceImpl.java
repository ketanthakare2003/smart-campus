package com.campus.smart.service.impl;

import com.campus.smart.event.SmartCampusEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.campus.smart.dto.DtoMapper;
import com.campus.smart.dto.JobApplicationDto;
import com.campus.smart.dto.JobDto;
import com.campus.smart.dto.StudentProfileDto;
import com.campus.smart.entity.Job;
import com.campus.smart.entity.JobApplication;
import com.campus.smart.entity.StudentProfile;
import com.campus.smart.entity.User;
import com.campus.smart.enums.ApplicationStatus;
import com.campus.smart.enums.JobStatus;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.exception.BadRequestException;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.repository.*;
import com.campus.smart.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public StudentProfileDto getProfile(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "email", email));
        return DtoMapper.toStudentProfileDto(profile);
    }

    @Override
    @Transactional
    public StudentProfileDto updateProfile(String email, StudentProfileDto profileDto) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "email", email));

        User user = profile.getUser();
        if (profileDto.getUser() != null && profileDto.getUser().getFullName() != null) {
            user.setFullName(profileDto.getUser().getFullName());
            userRepository.save(user);
        }

        profile.setRollNumber(profileDto.getRollNumber());
        profile.setDepartment(profileDto.getDepartment());
        profile.setCgpa(profileDto.getCgpa());
        profile.setSkills(profileDto.getSkills());
        profile.setResumeUrl(profileDto.getResumeUrl());
        profile.setGraduationBatch(profileDto.getGraduationBatch());

        StudentProfile updatedProfile = studentProfileRepository.save(profile);
        return DtoMapper.toStudentProfileDto(updatedProfile);
    }

    @Override
    public List<JobDto> getAllJobs(String email) {
        StudentProfile student = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "email", email));

        if (student.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your student account must be ACTIVE to view job listings.");
        }

        return jobRepository.findByStatus(JobStatus.OPEN).stream()
                .map(job -> {
                    JobDto dto = DtoMapper.toJobDto(job);
                    checkStudentEligibility(student, job, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobApplicationDto applyForJob(String email, Long jobId, String resumeUrl) {
        StudentProfile student = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "email", email));

        if (student.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your student account must be ACTIVE to apply for jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new BadRequestException("This job listing is already closed.");
        }

        if (jobApplicationRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new BadRequestException("You have already applied for this job.");
        }

        // Enforce Eligibility Validation on Backend API Level
        JobDto tempDto = new JobDto();
        checkStudentEligibility(student, job, tempDto);
        if (!tempDto.isEligible()) {
            throw new BadRequestException("Error: You do not satisfy the eligibility criteria for this job: " + String.join("; ", tempDto.getEligibilityReasons()));
        }

        // Create application
        JobApplication application = JobApplication.builder()
                .job(job)
                .student(student)
                .status(ApplicationStatus.APPLIED)
                .appliedDate(LocalDateTime.now())
                .resumeUrl(resumeUrl != null && !resumeUrl.isEmpty() ? resumeUrl : student.getResumeUrl())
                .build();

        if (application.getResumeUrl() == null || application.getResumeUrl().isEmpty()) {
            throw new BadRequestException("Please upload a resume before applying, or provide a custom resume URL.");
        }

        JobApplication saved = jobApplicationRepository.save(application);
        eventPublisher.publishEvent(new SmartCampusEvent(this, student.getUser(), "Job Application Submitted", "PLACEMENT", "Submitted job application for " + job.getTitle() + " at " + job.getCompany().getCompanyName(), "Smart Campus - Job Application Submitted", "<h2>Application Submitted</h2><p>You have successfully applied to: <b>" + job.getTitle() + "</b> at <b>" + job.getCompany().getCompanyName() + "</b></p>"));
        return DtoMapper.toJobApplicationDto(saved);
    }

    @Override
    public List<JobApplicationDto> getMyApplications(String email) {
        StudentProfile student = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "email", email));

        if (student.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your student account must be ACTIVE to track applications.");
        }

        return jobApplicationRepository.findByStudentId(student.getId()).stream()
                .map(DtoMapper::toJobApplicationDto)
                .collect(Collectors.toList());
    }

    private void checkStudentEligibility(StudentProfile student, Job job, JobDto dto) {
        java.util.List<String> reasons = new java.util.ArrayList<>();
        boolean eligible = true;

        // 1. CGPA check
        if (job.getMinimumCgpa() != null && job.getMinimumCgpa() > 0.0) {
            double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
            if (studentCgpa < job.getMinimumCgpa()) {
                eligible = false;
                reasons.add("Minimum CGPA Required: " + job.getMinimumCgpa() + " (Your CGPA: " + studentCgpa + ")");
            }
        }

        // 2. Department check
        if (job.getEligibleDepartments() != null && !job.getEligibleDepartments().trim().isEmpty()) {
            String studentDept = student.getDepartment() != null ? student.getDepartment().trim().toUpperCase() : "";
            boolean isEligibleDept = false;
            for (String dept : job.getEligibleDepartments().split(",")) {
                if (!dept.trim().isEmpty() && dept.trim().toUpperCase().equals(studentDept)) {
                    isEligibleDept = true;
                    break;
                }
            }
            if (!isEligibleDept) {
                eligible = false;
                reasons.add("Eligible Departments: " + job.getEligibleDepartments() + " (Your Department: " + (student.getDepartment() != null && !student.getDepartment().isEmpty() ? student.getDepartment() : "Not Specified") + ")");
            }
        }

        // 3. Graduation Batch check
        if (job.getEligibleBatches() != null && !job.getEligibleBatches().trim().isEmpty()) {
            String studentBatch = student.getGraduationBatch() != null ? String.valueOf(student.getGraduationBatch()).trim() : "";
            boolean isEligibleBatch = false;
            for (String batch : job.getEligibleBatches().split(",")) {
                if (!batch.trim().isEmpty() && batch.trim().equals(studentBatch)) {
                    isEligibleBatch = true;
                    break;
                }
            }
            if (!isEligibleBatch) {
                eligible = false;
                reasons.add("Eligible Batches: " + job.getEligibleBatches() + " (Your Batch: " + (student.getGraduationBatch() != null ? student.getGraduationBatch() : "Not Specified") + ")");
            }
        }

        // 4. Required Skills check
        if (job.getRequiredSkills() != null && !job.getRequiredSkills().trim().isEmpty()) {
            String studentSkills = student.getSkills() != null ? student.getSkills().toLowerCase() : "";
            java.util.List<String> missingSkills = new java.util.ArrayList<>();
            for (String reqSkill : job.getRequiredSkills().split(",")) {
                String cleanReqSkill = reqSkill.trim().toLowerCase();
                if (!cleanReqSkill.isEmpty() && !studentSkills.contains(cleanReqSkill)) {
                    missingSkills.add(reqSkill.trim());
                }
            }
            if (!missingSkills.isEmpty()) {
                eligible = false;
                reasons.add("Required Skills Missing: " + String.join(", ", missingSkills));
            }
        }

        dto.setEligible(eligible);
        dto.setEligibilityReasons(reasons);
    }
}
