package com.joycai.simpleoms.security

import com.joycai.simpleoms.model.User
import com.joycai.simpleoms.model.WebAuthnCredential
import com.joycai.simpleoms.repository.UserRepository
import com.joycai.simpleoms.repository.WebAuthnCredentialRepository
import org.redisson.api.RedissonClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Duration
import java.util.Base64

@Service
class WebAuthnService(
    private val userRepository: UserRepository,
    private val credentialRepository: WebAuthnCredentialRepository,
    private val redissonClient: RedissonClient,
    @Value("\${webauthn.rp-id:localhost}") private val rpId: String,
    @Value("\${webauthn.rp-name:simple-oms}") private val rpName: String,
    @Value("\${webauthn.origin:http://localhost:3200}") private val origin: String,
) {
    private val random = SecureRandom()
    private val b64 = Base64.getUrlEncoder().withoutPadding()

    fun startRegistration(username: String): Map<String, Any> {
        val challenge = generateChallenge()
        storeChallenge("reg:$username", challenge)
        val userId = b64.encodeToString(username.toByteArray())

        return mapOf(
            "challenge" to challenge,
            "rp" to mapOf("name" to rpName, "id" to rpId),
            "user" to mapOf("id" to userId, "name" to username, "displayName" to username),
            "pubKeyCredParams" to listOf(
                mapOf("type" to "public-key", "alg" to -7),
                mapOf("type" to "public-key", "alg" to -257),
            ),
            "authenticatorSelection" to mapOf(
                "userVerification" to "required",
            ),
            "excludeCredentials" to emptyList<Map<String, String>>(),
        )
    }

    data class RegistrationResponse(val id: String, val rawId: String, val type: String,
        val response: Map<String, Any>, val clientExtensionResults: Map<String, Any> = emptyMap())

    fun finishRegistration(username: String, credential: Map<String, Any>, deviceName: String): Map<String, String> {
        val challenge = getChallenge("reg:$username")
        if (challenge == null) return mapOf("message" to "Challenge expired, please retry")
        val user = userRepository.findByUsername(username) ?: return mapOf("message" to "User not found")
        val rawId = credential["rawId"] as? String ?: return mapOf("message" to "Missing credential ID")
        val response = credential["response"] as? Map<*, *> ?: return mapOf("message" to "Missing response")

        credentialRepository.save(
            WebAuthnCredential(
                user = user,
                credentialId = rawId,
                publicKeyJson = (response["publicKey"] as? String) ?: "",
                deviceName = deviceName,
            )
        )
        deleteChallenge("reg:$username")
        return mapOf("message" to "Passkey registered")
    }

    fun startLogin(username: String?): Map<String, Any> {
        val challenge = generateChallenge()
        storeChallenge("login:${username ?: "any"}", challenge)
        val allowCredentials = if (username != null) {
            val user = userRepository.findByUsername(username)
            if (user != null) {
                credentialRepository.findByUserId(user.id).map {
                    mapOf("id" to it.credentialId, "type" to "public-key")
                }
            } else emptyList()
        } else emptyList()

        return mapOf(
            "challenge" to challenge,
            "allowCredentials" to allowCredentials,
            "userVerification" to "required",
            "rpId" to rpId,
        )
    }

    fun finishLogin(username: String?, credential: Map<String, Any>): String? {
        val challenge = getChallenge("login:${username ?: "any"}")
        if (challenge == null) return null
        val rawId = credential["rawId"] as? String ?: return null

        // Find the credential by rawId
        val allCreds = if (username != null) {
            val user = userRepository.findByUsername(username)
            if (user != null) credentialRepository.findByUserId(user.id) else emptyList()
        } else {
            credentialRepository.findAll()
        }
        val matched = allCreds.find { it.credentialId == rawId } ?: return null
        matched.lastUsedAt = java.time.Instant.now()
        credentialRepository.save(matched)
        deleteChallenge("login:${username ?: "any"}")
        return matched.user.username
    }

    fun listCredentials(username: String): List<Map<String, Any>> {
        val user = userRepository.findByUsername(username) ?: return emptyList()
        return credentialRepository.findByUserId(user.id).map {
            mapOf(
                "id" to it.id,
                "deviceName" to (it.deviceName ?: "Unknown"),
                "lastUsedAt" to (it.lastUsedAt?.toString() ?: ""),
                "createdAt" to it.createdAt.toString(),
            )
        }
    }

    fun deleteCredential(username: String, credentialId: Long) {
        credentialRepository.deleteById(credentialId)
    }

    private fun generateChallenge(): String = b64.encodeToString(ByteArray(32).also { random.nextBytes(it) })
    private fun storeChallenge(key: String, value: String) =
        redissonClient.getBucket<String>("webauthn:$key").set(value, Duration.ofMinutes(5))
    private fun getChallenge(key: String): String? =
        redissonClient.getBucket<String>("webauthn:$key").get()
    private fun deleteChallenge(key: String) =
        redissonClient.getBucket<String>("webauthn:$key").delete()
}
