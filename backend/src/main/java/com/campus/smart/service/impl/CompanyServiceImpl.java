package com.campus.smart.service.impl;

import com.campus.smart.event.SmartCampusEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.campus.smart.dto.CompanyProfileDto;
import com.campus.smart.dto.DtoMapper;
import com.campus.smart.dto.JobApplicationDto;
import com.campus.smart.dto.JobDto;
import com.campus.smart.entity.CompanyProfile;
import com.campus.smart.entity.Job;
import com.campus.smart.entity.JobApplication;
import com.campus.smart.entity.StudentProfile;
import com.campus.smart.entity.User;
import com.campus.smart.enums.ApplicationStatus;
import com.campus.smart.enums.JobStatus;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.exception.BadRequestException;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.exception.UnauthorizedException;
import com.campus.smart.repository.*;
import com.campus.smart.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Override
    public CompanyProfileDto getProfile(String email) {
        CompanyProfile profile = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));
        return DtoMapper.toCompanyProfileDto(profile);
    }

    @Override
    @Transactional
    public CompanyProfileDto updateProfile(String email, CompanyProfileDto profileDto) {
        CompanyProfile profile = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));

        User user = profile.getUser();
        if (profileDto.getUser() != null && profileDto.getUser().getFullName() != null) {
            user.setFullName(profileDto.getUser().getFullName());
            userRepository.save(user);
        }

        profile.setCompanyName(profileDto.getCompanyName());
        profile.setWebsite(profileDto.getWebsite());
        profile.setDescription(profileDto.getDescription());
        profile.setIndustry(profileDto.getIndustry());

        CompanyProfile updated = companyProfileRepository.save(profile);
        return DtoMapper.toCompanyProfileDto(updated);
    }

    @Override
    @Transactional
    public JobDto postJob(String email, JobDto jobDto) {
        CompanyProfile company = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));

        if (company.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your company account must be ACTIVE to post jobs.");
        }

        Job job = Job.builder()
                .title(jobDto.getTitle())
                .description(jobDto.getDescription())
                .requirements(jobDto.getRequirements())
                .salaryPackage(jobDto.getSalaryPackage())
                .location(jobDto.getLocation())
                .company(company)
                .status(JobStatus.OPEN)
                .createdDate(LocalDateTime.now())
                .minimumCgpa(jobDto.getMinimumCgpa() != null ? jobDto.getMinimumCgpa() : 0.0)
                .eligibleDepartments(jobDto.getEligibleDepartments())
                .eligibleBatches(jobDto.getEligibleBatches())
                .requiredSkills(jobDto.getRequiredSkills())
                .build();

        Job saved = jobRepository.save(job);
        eventPublisher.publishEvent(new SmartCampusEvent(this, company.getUser(), "Job Opportunity Published", "PLACEMENT", "Published new job profile: " + job.getTitle(), "Smart Campus - Job Opportunity Published", "<h2>Job Published Successfully</h2><p>Your job profile: <b>" + job.getTitle() + "</b> has been published to all eligible scholars.</p>"));
        JobDto savedDto = DtoMapper.toJobDto(saved);
        savedDto.setEligibleStudentsCount(countEligibleStudents(saved));
        return savedDto;
    }

    @Override
    public List<JobDto> getMyJobs(String email) {
        CompanyProfile company = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));

        return jobRepository.findByCompanyId(company.getId()).stream()
                .map(job -> {
                    JobDto dto = DtoMapper.toJobDto(job);
                    dto.setEligibleStudentsCount(countEligibleStudents(job));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobDto updateJobStatus(Long jobId, String email, String status) {
        CompanyProfile company = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));

        if (company.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your company account must be ACTIVE to manage jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new UnauthorizedException("You are not authorized to update this job's status.");
        }

        try {
            job.setStatus(JobStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid job status: " + status + ". Use OPEN or CLOSED.");
        }

        Job updated = jobRepository.save(job);
        JobDto updatedDto = DtoMapper.toJobDto(updated);
        updatedDto.setEligibleStudentsCount(countEligibleStudents(updated));
        return updatedDto;
    }

    @Override
    public List<JobApplicationDto> getJobApplicants(String email) {
        CompanyProfile company = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));

        if (company.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your company account must be ACTIVE to view applicants.");
        }

        return jobApplicationRepository.findByJobCompanyId(company.getId()).stream()
                .map(DtoMapper::toJobApplicationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobApplicationDto updateApplicantStatus(Long applicationId, String email, ApplicationStatus status) {
        CompanyProfile company = companyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "email", email));

        if (company.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Error: Access denied. Your company account must be ACTIVE to update applicant status.");
        }

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", applicationId));

        if (!application.getJob().getCompany().getId().equals(company.getId())) {
            throw new UnauthorizedException("You are not authorized to update this applicant's status.");
        }

        application.setStatus(status);
        JobApplication updated = jobApplicationRepository.save(application);
        eventPublisher.publishEvent(new SmartCampusEvent(this, application.getStudent().getUser(), "Job Application Status Updated", "PLACEMENT", "Your application status for " + application.getJob().getTitle() + " has been updated to " + status, "Smart Campus - Job Application Update", "<h2>Application Status Update</h2><p>Your application status for <b>" + application.getJob().getTitle() + "</b> has been updated to: <b>" + status + "</b></p>"));
        return DtoMapper.toJobApplicationDto(updated);
    }

    private int countEligibleStudents(Job job) {
        List<StudentProfile> activeStudents = studentProfileRepository.findAll().stream()
                .filter(st -> st.getUser().getStatus() == UserStatus.ACTIVE)
                .collect(Collectors.toList());
        
        int count = 0;
        for (StudentProfile student : activeStudents) {
            if (isStudentEligibleForCount(student, job)) {
                count++;
            }
        }
        return count;
    }

    private boolean isStudentEligibleForCount(StudentProfile student, Job job) {
        // 1. CGPA check
        if (job.getMinimumCgpa() != null && job.getMinimumCgpa() > 0.0) {
            double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
            if (studentCgpa < job.getMinimumCgpa()) return false;
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
            if (!isEligibleDept) return false;
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
            if (!isEligibleBatch) return false;
        }

        // 4. Required Skills check
        if (job.getRequiredSkills() != null && !job.getRequiredSkills().trim().isEmpty()) {
            String studentSkills = student.getSkills() != null ? student.getSkills().toLowerCase() : "";
            for (String reqSkill : job.getRequiredSkills().split(",")) {
                String cleanReqSkill = reqSkill.trim().toLowerCase();
                if (!cleanReqSkill.isEmpty() && !studentSkills.contains(cleanReqSkill)) {
                    return false;
                }
            }
        }

        return true;
    }
}
