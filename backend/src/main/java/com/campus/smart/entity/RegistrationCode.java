package com.campus.smart.entity;

import com.campus.smart.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registration_codes", uniqueConstraints = {@UniqueConstraint(columnNames = "code")})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "target_role")
    private Role targetRole;

    @Column(nullable = false)
    private boolean used;

    @Column(nullable = false, name = "expires_at")
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "generated_by_id")
    private User generatedBy;

    @Column(name = "created_date")
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();
}
