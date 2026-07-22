package com.campus.smart.repository;

import com.campus.smart.entity.Job;
import com.campus.smart.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompanyId(Long companyProfileId);
    List<Job> findByStatus(JobStatus status);
}
