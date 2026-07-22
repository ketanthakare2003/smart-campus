package com.campus.smart.controller;

import com.campus.smart.dto.CompanyProfileDto;
import com.campus.smart.dto.PlacementDriveDto;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.repository.CompanyProfileRepository;
import com.campus.smart.repository.JobApplicationRepository;
import com.campus.smart.repository.PlacementDriveRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.service.TpoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tpo")
public class TpoController {

    @Autowired
    private TpoService tpoService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTpoStats() {
        long activeDrives = placementDriveRepository.count();
        long companies = companyProfileRepository.count();
        long totalRegistrations = userRepository.countByRole(Role.STUDENT);
        long eligible = userRepository.countByRoleAndStatus(Role.STUDENT, UserStatus.ACTIVE);

        long selected = jobApplicationRepository.findAll().stream()
                .filter(a -> a.getStatus().name().equals("SELECTED")).count();
        double placementRate = totalRegistrations > 0 ? ((double) selected / totalRegistrations) * 100 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeDrives", activeDrives);
        stats.put("companies", companies);
        stats.put("totalRegistrations", totalRegistrations);
        stats.put("studentsEligible", eligible);
        stats.put("placementRate", Math.round(placementRate * 100.0) / 100.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/companies")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<List<CompanyProfileDto>> getAllCompanies() {
        List<CompanyProfileDto> companies = tpoService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/companies/{id}")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<CompanyProfileDto> getCompanyById(@PathVariable Long id) {
        CompanyProfileDto company = tpoService.getCompanyById(id);
        return ResponseEntity.ok(company);
    }

    @DeleteMapping("/companies/{id}")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        tpoService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/drives")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<PlacementDriveDto> createPlacementDrive(@RequestBody PlacementDriveDto driveDto) {
        PlacementDriveDto created = tpoService.createPlacementDrive(driveDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/drives")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PlacementDriveDto>> getAllPlacementDrives() {
        List<PlacementDriveDto> drives = tpoService.getAllPlacementDrives();
        return ResponseEntity.ok(drives);
    }

    @GetMapping("/drives/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PlacementDriveDto> getPlacementDriveById(@PathVariable Long id) {
        PlacementDriveDto drive = tpoService.getPlacementDriveById(id);
        return ResponseEntity.ok(drive);
    }

    @PutMapping("/drives/{id}")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<PlacementDriveDto> updatePlacementDrive(@PathVariable Long id, @RequestBody PlacementDriveDto driveDto) {
        PlacementDriveDto updated = tpoService.updatePlacementDrive(id, driveDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/drives/{id}")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    public ResponseEntity<Void> deletePlacementDrive(@PathVariable Long id) {
        tpoService.deletePlacementDrive(id);
        return ResponseEntity.noContent().build();
    }
}
