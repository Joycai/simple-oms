package com.joycai.simpleoms.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") secret: String,
    @Value("\${jwt.access-expiration-ms}") private val accessExpirationMs: Long,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long,
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateAccessToken(username: String, roles: List<String>): String =
        Jwts.builder()
            .subject(username)
            .claim("roles", roles)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + accessExpirationMs))
            .signWith(key)
            .compact()

    fun generateRefreshToken(username: String, roles: List<String>): Pair<String, String> {
        val tokenId = UUID.randomUUID().toString()
        val token = Jwts.builder()
            .subject(username)
            .claim("roles", roles)
            .id(tokenId)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + refreshExpirationMs))
            .signWith(key)
            .compact()
        return tokenId to token
    }

    fun extractUsername(token: String): String =
        parseClaims(token).subject

    fun extractRoles(token: String): List<String> {
        @Suppress("UNCHECKED_CAST")
        return (parseClaims(token).get("roles", List::class.java) as? List<String>) ?: emptyList()
    }

    fun extractTokenId(token: String): String? =
        parseClaims(token).id

    fun isTokenValid(token: String): Boolean =
        try { parseClaims(token); true } catch (_: Exception) { false }

    private fun parseClaims(token: String): Claims =
        Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).payload
}
