package com.joycai.simpleoms.repository

import com.joycai.simpleoms.model.Role
import org.springframework.data.jpa.repository.JpaRepository

interface RoleRepository : JpaRepository<Role, Long> {
    fun findByName(name: String): Role?
    fun existsByName(name: String): Boolean
}
