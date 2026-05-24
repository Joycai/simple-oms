package com.joycai.simpleoms.security

import com.joycai.simpleoms.model.WebAuthnCredential
import com.joycai.simpleoms.repository.UserRepository
import com.joycai.simpleoms.repository.WebAuthnCredentialRepository
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.yubico.webauthn.*
import com.yubico.webauthn.data.*
import com.yubico.webauthn.data.ByteArray as YubiByteArray
import org.redisson.api.RedissonClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Duration
import java.time.Instant
import java.util.*

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
    private val json = ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    private val rpIdentity = RelyingPartyIdentity.builder()
        .id(rpId).name(rpName).build()

    private val rp: RelyingParty by lazy {
        RelyingParty.builder()
            .identity(rpIdentity)
            .credentialRepository(JpaStorage())
            .origins(setOf(origin))
            .allowOriginPort(true)
            .allowOriginSubdomain(true)
            .build()
    }

    // ── Registration ──────────────────────────────────────────────

    fun startRegistration(username: String): Map<String, Any> {
        val user = userRepository.findByUsername(username)
            ?: throw NoSuchElementException("User not found: $username")
        val userHandle = toByteArray(user.id.toString())
        val userIdentity = UserIdentity.builder()
            .name(username)
            .displayName(username)
            .id(userHandle)
            .build()

        val options = rp.startRegistration(
            StartRegistrationOptions.builder()
                .user(userIdentity)
                .build()
        )
        redisSet("reg:$username", options.toJson())
        @Suppress("UNCHECKED_CAST")
        return json.readValue(options.toJson(), Map::class.java) as Map<String, Any>
    }

    fun finishRegistration(username: String, credential: Map<String, Any>, deviceName: String): Map<String, String> {
        val stored = redisGet("reg:$username")
            ?: return mapOf("message" to "Challenge expired, please retry")
        val request = json.readValue(stored, PublicKeyCredentialCreationOptions::class.java)
        val pkc = PublicKeyCredential.parseRegistrationResponseJson(stripRawId(json.writeValueAsString(credential)))
        val result = rp.finishRegistration(
            FinishRegistrationOptions.builder()
                .request(request)
                .response(pkc)
                .build()
        )
        val user = userRepository.findByUsername(username)!!
        credentialRepository.save(
            WebAuthnCredential(
                user = user,
                credentialId = result.keyId.id.base64Url,
                userHandle = user.id.toString(),
                publicKeyCose = result.publicKeyCose.base64Url,
                signatureCount = result.signatureCount,
                deviceName = deviceName,
            )
        )
        redisDel("reg:$username")
        return mapOf("message" to "Passkey registered")
    }

    // ── Login (Assertion) ─────────────────────────────────────────

    fun startLogin(username: String?): Map<String, Any> {
        val builder = StartAssertionOptions.builder()
        if (username != null) {
            val user = userRepository.findByUsername(username)
            if (user != null) {
                builder.username(username)
            }
        }
        val assertion = rp.startAssertion(builder.build())
        // Store full AssertionRequest for verification
        redisSet("login:${username ?: "any"}", assertion.toJson())

        // @simplewebauthn/browser startAuthentication() expects
        // PublicKeyCredentialRequestOptions directly (unwrapped)
        @Suppress("UNCHECKED_CAST")
        val full = json.readValue(assertion.toJson(), Map::class.java) as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        return (full["publicKeyCredentialRequestOptions"] as? Map<String, Any>)
            ?: (full["publicKey"] as? Map<String, Any>)
            ?: full
    }

    fun finishLogin(username: String?, credential: Map<String, Any>): String? {
        val key = "login:${username ?: "any"}"
        val stored = redisGet(key) ?: return null
        val request = json.readValue(stored, AssertionRequest::class.java)
        val pkc = PublicKeyCredential.parseAssertionResponseJson(stripRawId(json.writeValueAsString(credential)))
        val result = rp.finishAssertion(
            FinishAssertionOptions.builder()
                .request(request)
                .response(pkc)
                .build()
        )
        if (!result.isSuccess) return null

        // Update signature count
        val cred = credentialRepository.findByCredentialId(result.credential.credentialId.base64Url)
        if (cred != null) {
            cred.signatureCount = result.signatureCount
            cred.lastUsedAt = Instant.now()
            credentialRepository.save(cred)
        }
        redisDel(key)
        return result.username
    }

    // ── Management ────────────────────────────────────────────────

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
        val user = userRepository.findByUsername(username) ?: return
        val creds = credentialRepository.findByUserId(user.id)
        val target = creds.find { it.id == credentialId } ?: return
        credentialRepository.delete(target)
    }

    // ── Redis helpers ─────────────────────────────────────────────

    private fun redisSet(key: String, value: String) =
        redissonClient.getBucket<String>("webauthn:$key").set(value, Duration.ofMinutes(5))

    private fun redisGet(key: String): String? =
        redissonClient.getBucket<String>("webauthn:$key").get()

    private fun redisDel(key: String) =
        redissonClient.getBucket<String>("webauthn:$key").delete()

    // ── helpers ────────────────────────────────────────────────────

    /** @simplewebauthn/browser includes rawId in JSON; yubico parser rejects it */
    private fun stripRawId(json: String): String =
        json.replace(Regex("\"rawId\"\\s*:\\s*\"[^\"]*\"\\s*,\\s*"), "")

    // ── yubico CredentialRepository adapter ───────────────────────

    private fun toByteArray(s: String) = YubiByteArray(s.toByteArray(Charsets.UTF_8))

    inner class JpaStorage : CredentialRepository {
        override fun getCredentialIdsForUsername(username: String): Set<PublicKeyCredentialDescriptor> {
            val user = userRepository.findByUsername(username) ?: return emptySet()
            return credentialRepository.findByUserId(user.id).map {
                PublicKeyCredentialDescriptor.builder()
                    .id(YubiByteArray(Base64.getUrlDecoder().decode(it.credentialId)))
                    .build()
            }.toSet()
        }

        override fun getUserHandleForUsername(username: String): Optional<YubiByteArray> {
            val user = userRepository.findByUsername(username) ?: return Optional.empty()
            return Optional.of(toByteArray(user.id.toString()))
        }

        override fun getUsernameForUserHandle(userHandle: YubiByteArray): Optional<String> {
            val userId = String(userHandle.bytes, Charsets.UTF_8).toLongOrNull() ?: return Optional.empty()
            return Optional.ofNullable(userRepository.findById(userId).orElse(null)?.username)
        }

        override fun lookup(credentialId: YubiByteArray, userHandle: YubiByteArray): Optional<RegisteredCredential> {
            val b64Id = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialId.bytes)
            val cred = credentialRepository.findByCredentialId(b64Id) ?: return Optional.empty()
            return Optional.of(toRegisteredCredential(cred))
        }

        override fun lookupAll(credentialId: YubiByteArray): Set<RegisteredCredential> {
            val b64Id = Base64.getUrlEncoder().withoutPadding().encodeToString(credentialId.bytes)
            val cred = credentialRepository.findByCredentialId(b64Id) ?: return emptySet()
            return setOf(toRegisteredCredential(cred))
        }

        private fun toRegisteredCredential(cred: WebAuthnCredential): RegisteredCredential {
            return RegisteredCredential.builder()
                .credentialId(YubiByteArray(Base64.getUrlDecoder().decode(cred.credentialId)))
                .userHandle(toByteArray(cred.userHandle))
                .publicKeyCose(YubiByteArray(Base64.getUrlDecoder().decode(cred.publicKeyCose)))
                .signatureCount(cred.signatureCount)
                .build()
        }
    }
}
