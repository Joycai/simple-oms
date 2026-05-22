package com.joycai.simpleoms.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long,
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateToken(username: String): String {
        val now = Date()
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(Date(now.time + expirationMs))
            .signWith(key)
            .compact()
    }

    fun extractUsername(token: String): String =
        parseClaims(token).subject

    fun isTokenValid(token: String): Boolean =
        try { parseClaims(token); true } catch (_: Exception) { false }

    private fun parseClaims(token: String): Claims =
        Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).payload
}
