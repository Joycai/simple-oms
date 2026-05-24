package com.joycai.simpleoms.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "signing_keys")
class SigningKey(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "kid", nullable = false, unique = true, length = 64)
    var kid: String,

    @Column(name = "key_type", nullable = false, length = 16)
    var keyType: String,

    @Column(name = "private_key_pem", nullable = false, columnDefinition = "TEXT")
    var privateKeyPem: String,

    @Column(name = "public_key_pem", nullable = false, columnDefinition = "TEXT")
    var publicKeyPem: String,

    @Column(name = "algorithm", nullable = false, length = 16)
    var algorithm: String,

    @Column(name = "active", nullable = false)
    var active: Boolean = true,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),
)
