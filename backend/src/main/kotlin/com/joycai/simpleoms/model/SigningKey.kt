package com.joycai.simpleoms.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "signing_keys")
class SigningKey(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "kid", nullable = false, unique = true, length = 64)
    val kid: String,

    @Column(name = "key_type", nullable = false, length = 16)
    val keyType: String,

    @Column(name = "private_key_pem", nullable = false, columnDefinition = "TEXT")
    val privateKeyPem: String,

    @Column(name = "public_key_pem", nullable = false, columnDefinition = "TEXT")
    val publicKeyPem: String,

    @Column(name = "algorithm", nullable = false, length = 16)
    val algorithm: String,

    @Column(name = "active", nullable = false)
    var active: Boolean = true,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
)
