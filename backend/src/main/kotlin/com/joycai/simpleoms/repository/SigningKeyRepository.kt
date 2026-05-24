package com.joycai.simpleoms.repository

import com.joycai.simpleoms.model.SigningKey
import org.springframework.data.jpa.repository.JpaRepository

interface SigningKeyRepository : JpaRepository<SigningKey, Long> {
    fun findByActiveTrue(): SigningKey?
    fun findByKid(kid: String): SigningKey?
}
