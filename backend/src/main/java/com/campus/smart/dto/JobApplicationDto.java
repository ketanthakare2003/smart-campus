package com.campus.smart.dto;

import com.campus.smart.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobApplicationDto {
    private Long id;
    private JobDto job;
    private StudentProfileDto student;
    private ApplicationStatus status;
    private LocalDateTime appliedDate;
    private String resumeUrl;
}
