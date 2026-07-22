package com.campus.smart.entity;

import com.campus.smart.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "salary_package")
    private String salaryPackage; // e.g. "12 LPA"

    private String location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_profile_id", nullable = false)
    private CompanyProfile company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "minimum_cgpa")
    private Double minimumCgpa = 0.0;

    @Column(name = "eligible_departments")
    private String eligibleDepartments;

    @Column(name = "eligible_batches")
    private String eligibleBatches;

    @Column(name = "required_skills")
    private String requiredSkills;
}
