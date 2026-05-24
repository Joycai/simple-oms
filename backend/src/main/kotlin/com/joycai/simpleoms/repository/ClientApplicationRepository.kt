package com.joycai.simpleoms.repository

import com.joycai.simpleoms.model.ClientApplication
import org.springframework.data.jpa.repository.JpaRepository

interface ClientApplicationRepository : JpaRepository<ClientApplication, Long> {
    fun findByClientId(clientId: String): ClientApplication?
    fun existsByClientId(clientId: String): Boolean
}
