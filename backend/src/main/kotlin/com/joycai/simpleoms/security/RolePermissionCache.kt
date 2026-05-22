package com.joycai.simpleoms.security

import com.joycai.simpleoms.repository.RoleRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class RolePermissionCache(
    private val roleRepository: RoleRepository,
) {

    @Cacheable("role_permissions", key = "#roleName")
    fun getPermissionsForRole(roleName: String): Set<String> {
        val role = roleRepository.findByName(roleName)
            ?: return emptySet()
        return role.permissions.map { it.code }.toSet()
    }
}
