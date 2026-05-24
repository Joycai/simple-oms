package com.joycai.simpleoms.security

import com.joycai.simpleoms.repository.SigningKeyRepository
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.PublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import java.util.Date
import java.util.UUID

@Component
class JwtUtil(
    private val signingKeyRepository: SigningKeyRepository,
    @Value("\${jwt.access-expiration-ms}") private val accessExpirationMs: Long,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long,
) {

    private fun getActiveKey() = signingKeyRepository.findByActiveTrue()
        ?: throw IllegalStateException("No active signing key found")

    private fun parsePrivateKey(pem: String): PrivateKey {
        val body = pem
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace("\\s".toRegex(), "")
        val bytes = Base64.getDecoder().decode(body)
        return KeyFactory.getInstance("EC").generatePrivate(PKCS8EncodedKeySpec(bytes))
    }

    private fun parsePublicKey(pem: String): PublicKey {
        val body = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")
        val bytes = Base64.getDecoder().decode(body)
        return KeyFactory.getInstance("EC").generatePublic(X509EncodedKeySpec(bytes))
    }

    fun generateAccessToken(username: String, roles: List<String>, permissions: List<String> = emptyList()): String {
        val key = getActiveKey()
        return Jwts.builder()
            .header().keyId(key.kid).and()
            .subject(username)
            .claim("roles", roles)
            .claim("permissions", permissions)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + accessExpirationMs))
            .signWith(parsePrivateKey(key.privateKeyPem))
            .compact()
    }

    fun generateRefreshToken(username: String, roles: List<String>, permissions: List<String> = emptyList()): Pair<String, String> {
        val tokenId = UUID.randomUUID().toString()
        val key = getActiveKey()
        val token = Jwts.builder()
            .header().keyId(key.kid).and()
            .subject(username)
            .claim("roles", roles)
            .claim("permissions", permissions)
            .id(tokenId)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + refreshExpirationMs))
            .signWith(parsePrivateKey(key.privateKeyPem))
            .compact()
        return tokenId to token
    }

    fun extractUsername(token: String): String = parseClaims(token).subject

    fun extractRoles(token: String): List<String> {
        @Suppress("UNCHECKED_CAST")
        return (parseClaims(token).get("roles", List::class.java) as? List<String>) ?: emptyList()
    }

    fun extractTokenId(token: String): String? = parseClaims(token).id

    fun isTokenValid(token: String): Boolean =
        try { parseClaims(token); true } catch (_: Exception) { false }

    private fun parseClaims(token: String): Claims {
        // Try all known public keys (supports key rotation)
        val errors = mutableListOf<Exception>()
        for (key in signingKeyRepository.findAll()) {
            try {
                return Jwts.parser()
                    .verifyWith(parsePublicKey(key.publicKeyPem))
                    .build()
                    .parseSignedClaims(token).payload
            } catch (e: Exception) {
                errors.add(e)
            }
        }
        throw errors.firstOrNull() ?: IllegalStateException("No signing keys available")
    }
}
