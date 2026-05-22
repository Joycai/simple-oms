package com.joycai.simpleoms.repository

import com.joycai.simpleoms.model.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByUsername(username: String): User?
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'admin'")
    fun countAdminUsers(): Long
}
