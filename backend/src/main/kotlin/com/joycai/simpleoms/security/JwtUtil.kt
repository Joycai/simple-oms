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

    fun generateAccessToken(username: String): String =
        buildToken(username, accessExpirationMs)

    fun generateRefreshToken(username: String): Pair<String, String> {
        val tokenId = UUID.randomUUID().toString()
        val token = Jwts.builder()
            .subject(username)
            .id(tokenId)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + refreshExpirationMs))
            .signWith(key)
            .compact()
        return tokenId to token
    }

    private fun buildToken(username: String, expirationMs: Long): String =
        Jwts.builder()
            .subject(username)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expirationMs))
            .signWith(key)
            .compact()

    fun extractUsername(token: String): String =
        parseClaims(token).subject

    fun extractTokenId(token: String): String? =
        parseClaims(token).id

    fun isTokenValid(token: String): Boolean =
        try { parseClaims(token); true } catch (_: Exception) { false }

    private fun parseClaims(token: String): Claims =
        Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).payload
}
