package com.campus.smart.repository;

import com.campus.smart.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByCategoryOrderByCreatedDateDesc(String category, Pageable pageable);
    Page<ActivityLog> findAllByOrderByCreatedDateDesc(Pageable pageable);
    java.util.List<ActivityLog> findByUserId(Long userId);
}
