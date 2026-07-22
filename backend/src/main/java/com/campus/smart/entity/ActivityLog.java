package com.campus.smart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String category; // e.g. "ONBOARDING", "SECURITY", "PLACEMENT", "NOTICE"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, name = "created_date")
    private LocalDateTime createdDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = true)
    private User user; // The user who performed or is the subject of the action
}
