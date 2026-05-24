package com.joycai.simpleoms.controller

import com.joycai.simpleoms.model.ClientApplication
import com.joycai.simpleoms.repository.ClientApplicationRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/admin/clients")
@PreAuthorize("hasRole('admin')")
class ClientController(
    private val clientApplicationRepository: ClientApplicationRepository,
    private val passwordEncoder: PasswordEncoder,
) {

    @GetMapping
    fun list(): ResponseEntity<List<Map<String, Any>>> {
        val clients = clientApplicationRepository.findAll().map {
            mapOf(
                "id" to it.id,
                "clientId" to it.clientId,
                "name" to it.name,
                "redirectUris" to (it.redirectUris ?: ""),
                "scopes" to (it.scopes ?: ""),
                "grantTypes" to it.grantTypes,
                "enabled" to it.enabled,
            )
        }
        return ResponseEntity.ok(clients)
    }

    @PostMapping
    fun create(@RequestBody body: Map<String, String>): ResponseEntity<Map<String, Any>> {
        val clientId = body["clientId"] ?: return ResponseEntity.badRequest().body(mapOf("message" to "clientId required"))
        if (clientApplicationRepository.existsByClientId(clientId))
            return ResponseEntity.badRequest().body(mapOf("message" to "clientId already exists"))
        val secret = body["clientSecret"] ?: UUID.randomUUID().toString().replace("-", "")
        val saved = clientApplicationRepository.save(
            ClientApplication(
                clientId = clientId,
                clientSecret = passwordEncoder.encode(secret),
                name = body["name"] ?: clientId,
                redirectUris = body["redirectUris"],
                scopes = body["scopes"],
                grantTypes = body["grantTypes"] ?: "client_credentials",
            )
        )
        return ResponseEntity.ok(mapOf(
            "id" to saved.id,
            "clientId" to saved.clientId,
            "clientSecret" to secret, // only returned on creation
            "name" to saved.name,
        ))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        if (!clientApplicationRepository.existsById(id))
            return ResponseEntity.notFound().build()
        clientApplicationRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "Client deleted"))
    }
}
