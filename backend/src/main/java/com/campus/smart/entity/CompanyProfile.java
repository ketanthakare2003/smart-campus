package com.campus.smart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String industry;
}
