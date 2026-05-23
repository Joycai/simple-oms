package com.joycai.simpleoms.repository

import com.joycai.simpleoms.model.WebAuthnCredential
import org.springframework.data.jpa.repository.JpaRepository

interface WebAuthnCredentialRepository : JpaRepository<WebAuthnCredential, Long> {
    fun findByUserId(userId: Long): List<WebAuthnCredential>
}
