package com.campus.smart.entity;

import com.campus.smart.enums.DriveStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "placement_drives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(name = "eligible_departments")
    private String eligibleDepartments; // e.g. "CSE, ECE, IT"

    @Column(name = "minimum_cgpa")
    private Double minimumCgpa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriveStatus status;
}
