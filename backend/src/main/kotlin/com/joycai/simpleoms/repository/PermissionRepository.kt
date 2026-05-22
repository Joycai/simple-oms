package com.joycai.simpleoms.repository

import com.joycai.simpleoms.model.Permission
import org.springframework.data.jpa.repository.JpaRepository

interface PermissionRepository : JpaRepository<Permission, Long> {
    fun findByCode(code: String): Permission?
    fun findByGroup(group: String): List<Permission>
}
