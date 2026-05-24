package com.joycai.iam.client.autoconfigure

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "iam")
data class IamProperties(
    val authServerUrl: String = "http://localhost:8080",
    val clientId: String = "",
    val clientSecret: String = "",
)
