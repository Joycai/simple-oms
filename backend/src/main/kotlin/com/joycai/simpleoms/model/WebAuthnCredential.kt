package com.joycai.simpleoms.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "webauthn_credentials")
class WebAuthnCredential(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(name = "credential_id", nullable = false, unique = true, length = 1000)
    val credentialId: String,

    @Column(name = "public_key", nullable = false, columnDefinition = "TEXT")
    val publicKeyJson: String,

    @Column(name = "signature_count", nullable = false)
    var signatureCount: Long = 0,

    @Column(name = "device_name", length = 100)
    val deviceName: String? = null,

    @Column(name = "last_used_at")
    var lastUsedAt: Instant? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
) {
    override fun equals(other: Any?): Boolean = other is WebAuthnCredential && other.id == id
    override fun hashCode(): Int = id.hashCode()
}
