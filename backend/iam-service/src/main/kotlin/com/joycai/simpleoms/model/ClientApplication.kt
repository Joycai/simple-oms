package com.joycai.simpleoms.model

import jakarta.persistence.*

@Entity
@Table(name = "client_applications")
class ClientApplication(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "client_id", nullable = false, unique = true, length = 64)
    var clientId: String,

    @Column(name = "client_secret", nullable = false, length = 256)
    var clientSecret: String,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,

    @Column(name = "redirect_uris", length = 2000)
    var redirectUris: String? = null,

    @Column(name = "scopes", length = 1000)
    var scopes: String? = null,

    @Column(name = "grant_types", nullable = false, length = 200)
    var grantTypes: String = "client_credentials",

    @Column(name = "enabled", nullable = false)
    var enabled: Boolean = true,
)
