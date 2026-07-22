package com.campus.smart.service;

import com.campus.smart.dto.JobApplicationDto;
import com.campus.smart.dto.JobDto;
import com.campus.smart.dto.StudentProfileDto;

import java.util.List;

public interface StudentService {
    StudentProfileDto getProfile(String email);
    StudentProfileDto updateProfile(String email, StudentProfileDto profileDto);
    List<JobDto> getAllJobs(String email);
    JobApplicationDto applyForJob(String email, Long jobId, String resumeUrl);
    List<JobApplicationDto> getMyApplications(String email);
}
