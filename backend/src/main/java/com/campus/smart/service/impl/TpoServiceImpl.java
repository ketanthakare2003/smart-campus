package com.campus.smart.service.impl;

import com.campus.smart.event.SmartCampusEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.campus.smart.dto.CompanyProfileDto;
import com.campus.smart.dto.DtoMapper;
import com.campus.smart.dto.PlacementDriveDto;
import com.campus.smart.entity.CompanyProfile;
import com.campus.smart.entity.PlacementDrive;
import com.campus.smart.enums.DriveStatus;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.repository.CompanyProfileRepository;
import com.campus.smart.repository.PlacementDriveRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.service.TpoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TpoServiceImpl implements TpoService {

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public List<CompanyProfileDto> getAllCompanies() {
        return companyProfileRepository.findAll().stream()
                .map(DtoMapper::toCompanyProfileDto)
                .collect(Collectors.toList());
    }

    @Override
    public CompanyProfileDto getCompanyById(Long id) {
        CompanyProfile company = companyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "id", id));
        return DtoMapper.toCompanyProfileDto(company);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        CompanyProfile company = companyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyProfile", "id", id));
        
        // Remove profile, User entity gets cascaded
        companyProfileRepository.delete(company);
    }

    @Override
    @Transactional
    public PlacementDriveDto createPlacementDrive(PlacementDriveDto driveDto) {
        PlacementDrive drive = PlacementDrive.builder()
                .name(driveDto.getName())
                .description(driveDto.getDescription())
                .date(driveDto.getDate())
                .eligibleDepartments(driveDto.getEligibleDepartments())
                .minimumCgpa(driveDto.getMinimumCgpa())
                .status(driveDto.getStatus() != null ? driveDto.getStatus() : DriveStatus.UPCOMING)
                .build();

        PlacementDrive saved = placementDriveRepository.save(drive);
        eventPublisher.publishEvent(new SmartCampusEvent(this, null, "Placement Drive Created", "PLACEMENT", "Published new placement drive: " + drive.getName(), "Smart Campus - Placement Drive Published", "<h2>Placement Drive Published</h2><p>A new placement drive has been created: <b>" + drive.getName() + "</b></p>"));
        return DtoMapper.toPlacementDriveDto(saved);
    }

    @Override
    public List<PlacementDriveDto> getAllPlacementDrives() {
        return placementDriveRepository.findAllByOrderByDateAsc().stream()
                .map(DtoMapper::toPlacementDriveDto)
                .collect(Collectors.toList());
    }

    @Override
    public PlacementDriveDto getPlacementDriveById(Long id) {
        PlacementDrive drive = placementDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", id));
        return DtoMapper.toPlacementDriveDto(drive);
    }

    @Override
    @Transactional
    public PlacementDriveDto updatePlacementDrive(Long id, PlacementDriveDto driveDto) {
        PlacementDrive drive = placementDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", id));

        drive.setName(driveDto.getName());
        drive.setDescription(driveDto.getDescription());
        drive.setDate(driveDto.getDate());
        drive.setEligibleDepartments(driveDto.getEligibleDepartments());
        drive.setMinimumCgpa(driveDto.getMinimumCgpa());
        drive.setStatus(driveDto.getStatus());

        PlacementDrive updated = placementDriveRepository.save(drive);
        return DtoMapper.toPlacementDriveDto(updated);
    }

    @Override
    @Transactional
    public void deletePlacementDrive(Long id) {
        if (!placementDriveRepository.existsById(id)) {
            throw new ResourceNotFoundException("PlacementDrive", "id", id);
        }
        placementDriveRepository.deleteById(id);
    }
}
