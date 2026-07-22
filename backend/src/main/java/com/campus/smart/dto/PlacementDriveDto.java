package com.campus.smart.dto;

import com.campus.smart.enums.DriveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlacementDriveDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime date;
    private String eligibleDepartments;
    private Double minimumCgpa;
    private DriveStatus status;
}
