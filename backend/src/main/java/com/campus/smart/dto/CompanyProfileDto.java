package com.campus.smart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyProfileDto {
    private Long id;
    private UserDto user;
    private String companyName;
    private String website;
    private String description;
    private String industry;
}
