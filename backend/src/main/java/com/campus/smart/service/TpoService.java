package com.campus.smart.service;

import com.campus.smart.dto.CompanyProfileDto;
import com.campus.smart.dto.PlacementDriveDto;

import java.util.List;

public interface TpoService {
    // Manage Companies
    List<CompanyProfileDto> getAllCompanies();
    CompanyProfileDto getCompanyById(Long id);
    void deleteCompany(Long id);
    
    // Manage Placement Drives
    PlacementDriveDto createPlacementDrive(PlacementDriveDto driveDto);
    List<PlacementDriveDto> getAllPlacementDrives();
    PlacementDriveDto getPlacementDriveById(Long id);
    PlacementDriveDto updatePlacementDrive(Long id, PlacementDriveDto driveDto);
    void deletePlacementDrive(Long id);
}
