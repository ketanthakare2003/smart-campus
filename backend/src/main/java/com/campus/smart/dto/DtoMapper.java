package com.campus.smart.dto;

import com.campus.smart.entity.*;

public class DtoMapper {

    public static UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    public static StudentProfileDto toStudentProfileDto(StudentProfile profile) {
        if (profile == null) return null;
        return StudentProfileDto.builder()
                .id(profile.getId())
                .user(toUserDto(profile.getUser()))
                .rollNumber(profile.getRollNumber())
                .department(profile.getDepartment())
                .cgpa(profile.getCgpa())
                .skills(profile.getSkills())
                .resumeUrl(profile.getResumeUrl())
                .graduationBatch(profile.getGraduationBatch())
                .build();
    }

    public static CompanyProfileDto toCompanyProfileDto(CompanyProfile profile) {
        if (profile == null) return null;
        return CompanyProfileDto.builder()
                .id(profile.getId())
                .user(toUserDto(profile.getUser()))
                .companyName(profile.getCompanyName())
                .website(profile.getWebsite())
                .description(profile.getDescription())
                .industry(profile.getIndustry())
                .build();
    }

    public static JobDto toJobDto(Job job) {
        if (job == null) return null;
        return JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .salaryPackage(job.getSalaryPackage())
                .location(job.getLocation())
                .company(toCompanyProfileDto(job.getCompany()))
                .status(job.getStatus())
                .createdDate(job.getCreatedDate())
                .minimumCgpa(job.getMinimumCgpa())
                .eligibleDepartments(job.getEligibleDepartments())
                .eligibleBatches(job.getEligibleBatches())
                .requiredSkills(job.getRequiredSkills())
                .build();
    }

    public static JobApplicationDto toJobApplicationDto(JobApplication application) {
        if (application == null) return null;
        return JobApplicationDto.builder()
                .id(application.getId())
                .job(toJobDto(application.getJob()))
                .student(toStudentProfileDto(application.getStudent()))
                .status(application.getStatus())
                .appliedDate(application.getAppliedDate())
                .resumeUrl(application.getResumeUrl())
                .build();
    }

    public static NoticeDto toNoticeDto(Notice notice) {
        if (notice == null) return null;
        return NoticeDto.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .postedBy(toUserDto(notice.getPostedBy()))
                .postedDate(notice.getPostedDate())
                .build();
    }

    public static PlacementDriveDto toPlacementDriveDto(PlacementDrive drive) {
        if (drive == null) return null;
        return PlacementDriveDto.builder()
                .id(drive.getId())
                .name(drive.getName())
                .description(drive.getDescription())
                .date(drive.getDate())
                .eligibleDepartments(drive.getEligibleDepartments())
                .minimumCgpa(drive.getMinimumCgpa())
                .status(drive.getStatus())
                .build();
    }

    public static RegistrationCodeDto toRegistrationCodeDto(RegistrationCode code) {
        if (code == null) return null;
        return RegistrationCodeDto.builder()
                .id(code.getId())
                .code(code.getCode())
                .targetRole(code.getTargetRole())
                .used(code.isUsed())
                .expiresAt(code.getExpiresAt())
                .generatedBy(toUserDto(code.getGeneratedBy()))
                .createdDate(code.getCreatedDate())
                .build();
    }
}
