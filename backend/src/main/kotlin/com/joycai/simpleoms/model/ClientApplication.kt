package com.joycai.simpleoms.model

import jakarta.persistence.*

@Entity
@Table(name = "client_applications")
class ClientApplication(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "client_id", nullable = false, unique = true, length = 64)
    val clientId: String,

    @Column(name = "client_secret", nullable = false, length = 256)
    val clientSecret: String,

    @Column(name = "name", nullable = false, length = 100)
    val name: String,

    @Column(name = "redirect_uris", length = 2000)
    val redirectUris: String? = null,

    @Column(name = "scopes", length = 1000)
    val scopes: String? = null,

    @Column(name = "grant_types", nullable = false, length = 200)
    val grantTypes: String = "client_credentials",

    @Column(name = "enabled", nullable = false)
    var enabled: Boolean = true,
)
