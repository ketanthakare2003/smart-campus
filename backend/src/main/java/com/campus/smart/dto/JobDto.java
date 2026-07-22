package com.campus.smart.dto;

import com.campus.smart.enums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobDto {
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String salaryPackage;
    private String location;
    private CompanyProfileDto company;
    private JobStatus status;
    private LocalDateTime createdDate;

    private Double minimumCgpa;
    private String eligibleDepartments;
    private String eligibleBatches;
    private String requiredSkills;
    
    private boolean eligible;
    private java.util.List<String> eligibilityReasons;
    private int eligibleStudentsCount;
}
