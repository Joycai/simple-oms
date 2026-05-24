package com.joycai.simpleoms.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "webauthn_credentials")
class WebAuthnCredential(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    @Column(name = "credential_id", nullable = false, unique = true, length = 1000)
    var credentialId: String,

    @Column(name = "user_handle", nullable = false, length = 256, columnDefinition = "VARCHAR(256) DEFAULT '0'")
    var userHandle: String,

    @Column(name = "public_key", nullable = false, columnDefinition = "TEXT")
    var publicKeyCose: String,

    @Column(name = "signature_count", nullable = false)
    var signatureCount: Long = 0,

    @Column(name = "device_name", length = 100)
    var deviceName: String? = null,

    @Column(name = "last_used_at")
    var lastUsedAt: Instant? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),
) {
    override fun equals(other: Any?): Boolean = other is WebAuthnCredential && other.id == id
    override fun hashCode(): Int = id.hashCode()
}
