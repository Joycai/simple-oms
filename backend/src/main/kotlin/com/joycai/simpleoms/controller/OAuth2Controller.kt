package com.joycai.simpleoms.controller

import com.joycai.simpleoms.repository.ClientApplicationRepository
import com.joycai.simpleoms.security.JwtUtil
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class OAuth2Controller(
    private val clientApplicationRepository: ClientApplicationRepository,
    private val jwtUtil: JwtUtil,
    private val passwordEncoder: PasswordEncoder,
) {

    @PostMapping("/api/v1/oauth2/token")
    fun token(
        @RequestParam("grant_type") grantType: String,
        @RequestParam("client_id") clientId: String,
        @RequestParam("client_secret") clientSecret: String,
    ): ResponseEntity<Map<String, Any>> {
        if (grantType != "client_credentials")
            return ResponseEntity.badRequest().body(mapOf("error" to "unsupported_grant_type"))

        val client = clientApplicationRepository.findByClientId(clientId)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "invalid_client"))

        if (!client.enabled || !passwordEncoder.matches(clientSecret, client.clientSecret))
            return ResponseEntity.badRequest().body(mapOf("error" to "invalid_client"))

        val scopes = client.scopes?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
        val roles = listOf("service:${client.clientId}")

        val accessToken = jwtUtil.generateAccessToken("service:${client.clientId}", roles + scopes)
        val (_, refreshToken) = jwtUtil.generateRefreshToken("service:${client.clientId}", roles + scopes)

        return ResponseEntity.ok(mapOf(
            "access_token" to accessToken,
            "refresh_token" to refreshToken,
            "token_type" to "Bearer",
            "expires_in" to 900,
            "scope" to scopes.joinToString(" "),
        ))
    }
}
