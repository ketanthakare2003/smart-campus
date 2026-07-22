package com.campus.smart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentProfileDto {
    private Long id;
    private UserDto user;
    private String rollNumber;
    private String department;
    private Double cgpa;
    private String skills;
    private String resumeUrl;
    private Integer graduationBatch;
}
