package com.campus.smart.service;

import com.campus.smart.dto.CompanyProfileDto;
import com.campus.smart.dto.JobApplicationDto;
import com.campus.smart.dto.JobDto;
import com.campus.smart.enums.ApplicationStatus;

import java.util.List;

public interface CompanyService {
    CompanyProfileDto getProfile(String email);
    CompanyProfileDto updateProfile(String email, CompanyProfileDto profileDto);
    
    JobDto postJob(String email, JobDto jobDto);
    List<JobDto> getMyJobs(String email);
    JobDto updateJobStatus(Long jobId, String email, String status); // e.g. OPEN or CLOSED
    
    List<JobApplicationDto> getJobApplicants(String email);
    JobApplicationDto updateApplicantStatus(Long applicationId, String email, ApplicationStatus status);
}
