package com.campus.smart.repository;

import com.campus.smart.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStudentId(Long studentProfileId);
    List<JobApplication> findByJobId(Long jobId);
    List<JobApplication> findByJobCompanyId(Long companyProfileId);
    boolean existsByJobIdAndStudentId(Long jobId, Long studentProfileId);
}
